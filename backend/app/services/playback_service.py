from datetime import datetime, timedelta
import os

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.subscription import UserDevice
from app.models.title import Title
from app.models.user import User
from app.services.subscription_service import get_user_membership, has_active_subscription

SAMPLE_TRAILER = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
SAMPLE_PREVIEW = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
SAMPLE_4K = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"


def subscription_required() -> bool:
    # SRS use-case diagram: "Play Video" includes "Check Active Subscription".
    # Set REQUIRE_SUBSCRIPTION=false in backend/.env to switch the check off while demoing.
    return os.getenv("REQUIRE_SUBSCRIPTION", "true").lower() == "true"


def validate_device_limit(db: Session, user_id: int, device_id: str | None, device_limit: int):
    """Register device and ensure registered device count does not exceed plan limit."""
    if not device_id:
        return

    # Check active devices within the last 7 days
    active_cutoff = datetime.now() - timedelta(days=7)
    devices = (
        db.query(UserDevice)
        .filter(UserDevice.user_id == user_id, UserDevice.last_active >= active_cutoff)
        .order_by(UserDevice.last_active.desc())
        .all()
    )

    registered_ids = [d.device_id for d in devices]
    if device_id in registered_ids:
        # Update timestamp for existing device
        device = next(d for d in devices if d.device_id == device_id)
        device.last_active = datetime.now()
        db.commit()
    else:
        # New device: check limit
        if len(registered_ids) >= device_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Device limit exceeded. Your current plan allows up to {device_limit} active {'device' if device_limit == 1 else 'devices'}. Please upgrade to Premium or log out from other devices.",
            )
        new_dev = UserDevice(user_id=user_id, device_id=device_id, last_active=datetime.now())
        db.add(new_dev)
        db.commit()


def get_playable_title(
    db: Session,
    user_id: int,
    title_id: int,
    kind: str = "full",
    requested_quality: str = "1080p",
    device_id: str | None = None,
):
    """Retrieve authorized playable stream for a title based on subscription level.
    - Free Viewer: Trailer & 2-minute preview only. Full video rejected with 403.
    - Basic Member: Full video up to 1080p, 1 device limit. 4K rejected or capped.
    - Premium Member: Full video up to 4K (when available), 4 devices limit.
    - Admin: Full video up to 4K, unrestricted.
    """
    title = db.get(Title, title_id)
    if title is None or not title.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Title not found")

    membership, sub, plan = get_user_membership(db, user_id)
    is_admin = membership == "admin"
    is_subscribed = membership in ("basic", "premium") or is_admin

    # Handle trailer playback (Available to all users including Free viewers)
    if kind == "trailer":
        trailer_url = title.trailer_url or title.video_url or SAMPLE_TRAILER
        return {
            "title_id": title.id,
            "title": f"{title.title} (Trailer)",
            "video_url": trailer_url,
            "access_level": membership,
            "is_preview": False,
            "preview_duration": None,
            "quality": "1080p",
            "actual_quality": "1080p",
            "max_quality_supported": title.max_quality or "1080p",
            "trailer_url": trailer_url,
            "upgrade_required": False,
        }

    # Handle 2-minute preview playback (Available to all users, capped at 120s for Free viewers)
    if kind == "preview":
        preview_url = title.preview_url or SAMPLE_PREVIEW
        return {
            "title_id": title.id,
            "title": f"{title.title} (Preview)",
            "video_url": preview_url,
            "access_level": membership,
            "is_preview": True,
            "preview_duration": 120,
            "quality": "1080p",
            "actual_quality": "1080p",
            "max_quality_supported": title.max_quality or "1080p",
            "trailer_url": title.trailer_url or SAMPLE_TRAILER,
            "upgrade_required": not is_subscribed,
            "message": "You are watching the free 2-minute preview. Upgrade to Basic (₹199) or Premium (₹499) to watch full movie.",
        }

    # Full movie playback: requires active subscription (unless demo switch is false)
    if subscription_required() and not is_subscribed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription required",
        )

    if not title.video_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not available")

    # Validate device limits if device_id provided
    device_limit = 4 if (is_admin or membership == "premium") else 1
    validate_device_limit(db, user_id, device_id, device_limit)

    # Determine streaming quality
    stream_url = title.video_url
    actual_quality = "1080p"
    req_q = (requested_quality or "1080p").lower()

    if req_q == "4k":
        if membership == "basic":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="4K Ultra HD streaming requires a Premium subscription (₹499/month). Your Basic plan supports up to 1080p Full HD.",
            )
        elif membership in ("premium", "admin"):
            # Only stream 4K if source actually supports 4K
            if (title.max_quality == "4k" or title.video_url_4k):
                stream_url = title.video_url_4k or title.video_url
                actual_quality = "4k"
            else:
                # Honest representation: movie only available in 1080p
                stream_url = title.video_url
                actual_quality = "1080p"

    return {
        "title_id": title.id,
        "title": title.title,
        "video_url": stream_url,
        "access_level": membership,
        "is_preview": False,
        "preview_duration": None,
        "quality": req_q,
        "actual_quality": actual_quality,
        "max_quality_supported": title.max_quality or "1080p",
        "trailer_url": title.trailer_url or SAMPLE_TRAILER,
        "upgrade_required": False,
    }


def check_title_access(db: Session, user_id: int, title_id: int):
    """Pre-playback check to inform the UI of available options and permissions."""
    title = db.get(Title, title_id)
    if title is None or not title.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Title not found")

    membership, sub, plan = get_user_membership(db, user_id)
    is_admin = membership == "admin"
    is_subscribed = membership in ("basic", "premium") or is_admin

    is_4k_avail = bool(title.max_quality == "4k" or title.video_url_4k)
    max_q = "4k" if (is_admin or membership == "premium") and is_4k_avail else "1080p"

    return {
        "title_id": title.id,
        "title": title.title,
        "can_watch_full": is_subscribed,
        "can_watch_preview": True,
        "can_watch_trailer": True,
        "membership": membership,
        "max_quality": max_q,
        "is_4k_available": is_4k_avail,
        "trailer_url": title.trailer_url or SAMPLE_TRAILER,
        "preview_url": title.preview_url or SAMPLE_PREVIEW,
    }

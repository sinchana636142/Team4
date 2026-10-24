import os

from fastapi import HTTPException

from app.models.title import Title
from app.services.subscription_service import has_active_subscription


def subscription_required():
    # SRS use-case diagram: "Play Video" includes "Check Active Subscription".
    # Set REQUIRE_SUBSCRIPTION=false in backend/.env to switch the check off while demoing.
    return os.getenv("REQUIRE_SUBSCRIPTION", "true").lower() == "true"


def get_playable_title(db, user_id, title_id):
    title = db.get(Title, title_id)
    if title is None or not title.is_published:
        raise HTTPException(status_code=404, detail="Title not found")

    if subscription_required() and not has_active_subscription(db, user_id):
        raise HTTPException(status_code=403, detail="Active subscription required")

    if not title.video_url:
        raise HTTPException(status_code=404, detail="Video not available")

    return title

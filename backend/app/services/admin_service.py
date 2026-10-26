from datetime import date
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.subscription import Plan, Subscription
from app.models.title import Title
from app.models.user import User
from app.schemas.admin import TitleCreateRequest, TitleUpdateRequest, UserAdminItem
from app.services.subscription_service import build_status


def create_title(db: Session, request: TitleCreateRequest) -> Title:
    """OTT-F-050: Create and upload title and metadata."""
    title = Title(
        title=request.title.strip(),
        genre=request.genre.strip() if request.genre else None,
        year=request.year,
        synopsis=request.synopsis.strip() if request.synopsis else None,
        poster_url=request.poster_url.strip() if request.poster_url else None,
        video_url=request.video_url.strip() if request.video_url else None,
        is_published=request.is_published,
    )
    db.add(title)
    db.commit()
    db.refresh(title)
    return title


def update_title(db: Session, title_id: int, request: TitleUpdateRequest) -> Title:
    title = db.get(Title, title_id)
    if not title:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Title with id {title_id} not found.",
        )

    changes = request.model_dump(exclude_unset=True)
    for field, val in changes.items():
        if isinstance(val, str):
            val = val.strip()
        setattr(title, field, val)

    db.commit()
    db.refresh(title)
    return title


def set_title_publish_status(db: Session, title_id: int, is_published: bool) -> Title:
    """OTT-F-051: Publish or unpublish title from live catalog."""
    title = db.get(Title, title_id)
    if not title:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Title with id {title_id} not found.",
        )

    title.is_published = is_published
    db.commit()
    db.refresh(title)
    return title


def list_titles_admin(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    genre: str | None = None,
) -> list[Title]:
    query = db.query(Title)
    if genre and genre.lower() != "all":
        query = query.filter(func.lower(Title.genre) == genre.lower())
    return query.order_by(Title.id.desc()).offset(skip).limit(limit).all()


def list_users_and_subscriptions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
) -> dict:
    """OTT-F-052: View registered users and subscription status with pagination.
    Excludes sensitive fields (passwords, OTPs, tokens).
    """
    query = db.query(User)
    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(User.full_name).like(search_pattern),
                func.lower(User.email).like(search_pattern),
            )
        )

    total = query.count()
    users = query.order_by(User.id.asc()).offset(skip).limit(limit).all()

    items = []
    for u in users:
        sub_info = build_status(db, u.id)
        items.append(
            UserAdminItem(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                is_verified=u.is_verified,
                is_admin=getattr(u, "is_admin", False),
                role=getattr(u, "role", "viewer"),
                created_at=u.created_at,
                subscription_status=sub_info.get("status", "none"),
                plan_name=sub_info.get("plan_name"),
                expiry_date=sub_info.get("expiry_date"),

            )
        )

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items,
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.title import Title
from app.models.watchlist import WatchlistItem
from app.routers.profile import get_current_user

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


def find_item(db, user_id, title_id):
    return (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user_id, WatchlistItem.title_id == title_id)
        .first()
    )


@router.get("")
def list_watchlist(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The logged-in user's watchlist (most recently added first)."""
    rows = (
        db.query(WatchlistItem, Title)
        .join(Title, Title.id == WatchlistItem.title_id)
        .filter(WatchlistItem.user_id == current_user.id)
        .order_by(WatchlistItem.id.desc())
        .all()
    )
    return [
        {"title_id": title.id, "title": title.title, "poster_url": title.poster_url}
        for item, title in rows
    ]


@router.post("/{title_id}")
def add_to_watchlist(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-030: add a title. Adding twice is harmless."""
    if db.get(Title, title_id) is None:
        raise HTTPException(status_code=404, detail="Title not found")

    if find_item(db, current_user.id, title_id) is None:
        db.add(WatchlistItem(user_id=current_user.id, title_id=title_id))
        db.commit()
    return {"title_id": title_id, "in_watchlist": True}


@router.delete("/{title_id}")
def remove_from_watchlist(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-030: remove a title. Removing something not in the list is harmless."""
    item = find_item(db, current_user.id, title_id)
    if item is not None:
        db.delete(item)
        db.commit()
    return {"title_id": title_id, "in_watchlist": False}

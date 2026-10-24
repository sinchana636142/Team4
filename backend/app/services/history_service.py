from datetime import timezone

from fastapi import HTTPException

from app.models.playback import WatchHistory
from app.models.title import Title


def utc_text(moment):
    # SQLite gives back a naive time, PostgreSQL an aware one; always answer in UTC with "Z"
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"


def record_view(db, user_id, title_id):
    if db.get(Title, title_id) is None:
        raise HTTPException(status_code=404, detail="Title not found")

    entry = WatchHistory(user_id=user_id, title_id=title_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "title_id": title_id, "watched_at": utc_text(entry.watched_at)}


def list_history(db, user_id):
    rows = (
        db.query(WatchHistory, Title)
        .join(Title, Title.id == WatchHistory.title_id)
        .filter(WatchHistory.user_id == user_id)
        .order_by(WatchHistory.id.desc())
        .all()
    )
    return [
        {
            "id": entry.id,
            "title_id": title.id,
            "title": title.title,
            "poster_url": title.poster_url,
            "watched_at": utc_text(entry.watched_at),
        }
        for entry, title in rows
    ]

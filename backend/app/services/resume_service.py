from fastapi import HTTPException

from app.models.playback import PlaybackProgress
from app.models.title import Title


def check_title_exists(db, title_id):
    if db.get(Title, title_id) is None:
        raise HTTPException(status_code=404, detail="Title not found")


def find_progress(db, user_id, title_id):
    return (
        db.query(PlaybackProgress)
        .filter(PlaybackProgress.user_id == user_id, PlaybackProgress.title_id == title_id)
        .first()
    )


def get_position(db, user_id, title_id):
    check_title_exists(db, title_id)
    progress = find_progress(db, user_id, title_id)
    return progress.position_seconds if progress else 0


def save_position(db, user_id, title_id, position_seconds):
    check_title_exists(db, title_id)
    progress = find_progress(db, user_id, title_id)
    if progress is None:
        progress = PlaybackProgress(user_id=user_id, title_id=title_id)
        db.add(progress)
    progress.position_seconds = position_seconds
    db.commit()
    return progress.position_seconds

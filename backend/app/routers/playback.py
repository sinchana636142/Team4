from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.schemas.playback import ResumeRequest
from app.services.playback_service import get_playable_title
from app.services.history_service import (
    clear_history,
    delete_history_entry,
    list_history,
    record_view,
)
from app.services.resume_service import get_position, save_position

router = APIRouter(prefix="/playback", tags=["Playback"])


@router.get("/")
def get_playback_status():
    return {"module": "Playback", "status": "available"}


@router.get("/history")
def get_watch_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The logged-in user's watch history, newest first."""
    return list_history(db, current_user.id)


@router.delete("/history")
def delete_watch_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all watch-history entries belonging to the logged-in user."""
    return clear_history(db, current_user.id)


@router.delete("/history/{history_id}")
def delete_watch_history_entry(
    history_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete one watch-history entry belonging to the logged-in user."""
    return delete_history_entry(db, current_user.id, history_id)


@router.post("/{title_id}/history", status_code=201)
def post_watch_history(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-022: record one viewing session (called when playback starts)."""
    return record_view(db, current_user.id, title_id)


@router.get("/{title_id}/resume")
def get_resume_position(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-021: where the user stopped watching (0 if never watched)."""
    return {"position_seconds": get_position(db, current_user.id, title_id)}


@router.put("/{title_id}/resume")
def put_resume_position(
    title_id: int,
    request: ResumeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = save_position(db, current_user.id, title_id, request.position_seconds)
    return {"position_seconds": saved}


@router.get("/{title_id}")
def play_title(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-020: give the browser the video URL; the HTML5 player streams it from storage."""
    title = get_playable_title(db, current_user.id, title_id)
    return {"title_id": title.id, "title": title.title, "video_url": title.video_url}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.services.playback_service import get_playable_title

router = APIRouter(prefix="/playback", tags=["Playback"])


@router.get("/")
def get_playback_status():
    return {"module": "Playback", "status": "available"}


@router.get("/{title_id}")
def play_title(
    title_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-020: give the browser the video URL; the HTML5 player streams it from storage."""
    title = get_playable_title(db, current_user.id, title_id)
    return {"title_id": title.id, "title": title.title, "video_url": title.video_url}

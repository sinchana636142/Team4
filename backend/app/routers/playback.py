from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.schemas.playback import ResumeRequest
from app.services.playback_service import get_playable_title
from app.services.resume_service import get_position, save_position

router = APIRouter(prefix="/playback", tags=["Playback"])


@router.get("/")
def get_playback_status():
    return {"module": "Playback", "status": "available"}


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

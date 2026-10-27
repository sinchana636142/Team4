import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.profile import get_current_admin
from app.schemas.admin import (
    PaginatedUsersResponse,
    TitleAdminResponse,
    TitleCreateRequest,
    TitleUpdateRequest,
)
from app.services.admin_service import (
    create_title,
    list_titles_admin,
    list_users_and_subscriptions,
    set_title_publish_status,
    update_title,
)

router = APIRouter(prefix="/admin", tags=["Admin"])

# Static upload directories for actual file storage
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
POSTERS_DIR = os.path.join(UPLOAD_DIR, "posters")
VIDEOS_DIR = os.path.join(UPLOAD_DIR, "videos")
os.makedirs(POSTERS_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)


@router.get("/")
def get_admin_status():
    return {"module": "Admin", "status": "available"}


# --- Title Management (OTT-F-050 & OTT-F-051) ---

@router.post("/titles", response_model=TitleAdminResponse, status_code=status.HTTP_201_CREATED)
def admin_create_title(
    request: TitleCreateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """OTT-F-050: Administrator uploads title with metadata."""
    return create_title(db, request)


@router.get("/titles", response_model=list[TitleAdminResponse])
def admin_list_titles(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    genre: str | None = Query(default=None),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all titles (published and unpublished) for admin review."""
    return list_titles_admin(db, skip=skip, limit=limit, genre=genre)


@router.get("/titles/{title_id}", response_model=TitleAdminResponse)
def admin_get_title(
    title_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.models.title import Title
    title = db.get(Title, title_id)
    if not title:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Title with id {title_id} not found.",
        )
    return title


@router.put("/titles/{title_id}", response_model=TitleAdminResponse)
def admin_update_title(
    title_id: int,
    request: TitleUpdateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update title metadata."""
    return update_title(db, title_id, request)


@router.patch("/titles/{title_id}/publish", response_model=TitleAdminResponse)
def admin_publish_title(
    title_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """OTT-F-051: Publish title to the live catalog."""
    return set_title_publish_status(db, title_id, is_published=True)


@router.patch("/titles/{title_id}/unpublish", response_model=TitleAdminResponse)
def admin_unpublish_title(
    title_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """OTT-F-051: Unpublish title from the live catalog."""
    return set_title_publish_status(db, title_id, is_published=False)


# --- Secure File Upload (OTT-F-050) ---

@router.post("/upload/poster")
def upload_poster_file(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_admin),
):
    """Upload poster image file securely."""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type. Allowed: {', '.join(allowed_extensions)}",
        )

    safe_name = f"poster_{uuid4().hex}{ext}"
    dest_path = os.path.join(POSTERS_DIR, safe_name)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/uploads/posters/{safe_name}", "filename": safe_name}


@router.post("/upload/video")
def upload_video_file(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_admin),
):
    """Upload video media file securely."""
    allowed_extensions = {".mp4", ".webm", ".mkv"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid video type. Allowed: {', '.join(allowed_extensions)}",
        )

    safe_name = f"video_{uuid4().hex}{ext}"
    dest_path = os.path.join(VIDEOS_DIR, safe_name)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/uploads/videos/{safe_name}", "filename": safe_name}


# --- User & Subscription Management (OTT-F-052) ---

@router.get("/users", response_model=PaginatedUsersResponse)
def admin_view_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """OTT-F-052: View registered users and subscription status.
    Protected administrative view, no sensitive credentials exposed.
    """
    return list_users_and_subscriptions(db, skip=skip, limit=limit, search=search)
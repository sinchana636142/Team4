from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.title import Title
from app.schemas.admin import TitleAdminResponse

router = APIRouter(prefix="/catalog", tags=["Catalog"])


@router.get("/")
def get_catalog_status():
    return {"module": "Catalog", "status": "available"}


@router.get("/titles", response_model=list[TitleAdminResponse])
def get_public_catalog(
    genre: str | None = Query(default=None),
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """OTT-F-051: Public catalog only returns published titles."""
    query = db.query(Title).filter(Title.is_published.is_(True))

    if genre and genre.lower() != "all":
        query = query.filter(func.lower(Title.genre) == genre.lower())

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Title.title).like(term),
                func.lower(Title.genre).like(term),
                func.lower(Title.synopsis).like(term),
            )
        )

    return query.order_by(Title.id.asc()).offset(skip).limit(limit).all()


@router.get("/titles/{title_id}", response_model=TitleAdminResponse)
def get_public_title_detail(
    title_id: int,
    db: Session = Depends(get_db),
):
    """OTT-F-051: Unpublished titles return 404 to ordinary users."""
    title = db.get(Title, title_id)
    if not title or not title.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Title not found",
        )
    return title


@router.get("/genres")
def get_catalog_genres(
    db: Session = Depends(get_db),
):
    """List distinct genres available in the published catalog."""
    rows = (
        db.query(Title.genre)
        .filter(Title.is_published.is_(True), Title.genre.isnot(None))
        .distinct()
        .all()
    )
    genre_list = [r[0] for r in rows if r[0]]
    return ["All"] + sorted(list(set(genre_list)))
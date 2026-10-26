from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.models.rating import Rating
from app.schemas.rating import RatingCreate, RatingResponse

router = APIRouter(
    prefix="/ratings",
    tags=["Ratings"],
)


@router.post(
    "/",
    response_model=RatingResponse,
    status_code=status.HTTP_200_OK,
)
def create_or_update_rating(
    payload: RatingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_rating = (
        db.query(Rating)
        .filter(
            Rating.user_id == current_user.id,
            Rating.title_id == payload.title_id,
        )
        .first()
    )

    if existing_rating:
        existing_rating.rating = payload.rating
        db.commit()
        db.refresh(existing_rating)
        return existing_rating

    new_rating = Rating(
        user_id=current_user.id,
        title_id=payload.title_id,
        rating=payload.rating,
    )

    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    return new_rating


@router.get(
    "/my",
    response_model=list[RatingResponse],
)
def get_my_ratings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Rating)
        .filter(Rating.user_id == current_user.id)
        .all()
    )


@router.get(
    "/title/{title_id}/average",
)
def get_title_average_rating(
    title_id: int,
    db: Session = Depends(get_db),
):
    from sqlalchemy import func

    result = (
        db.query(
            func.avg(Rating.rating).label("average_rating"),
            func.count(Rating.id).label("total_ratings"),
        )
        .filter(Rating.title_id == title_id)
        .first()
    )

    return {
        "title_id": title_id,
        "average_rating": (
            round(float(result.average_rating), 2)
            if result.average_rating is not None
            else None
        ),
        "total_ratings": result.total_ratings or 0,
    }
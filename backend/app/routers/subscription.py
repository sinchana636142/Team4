from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.schemas.subscription import SubscriptionStatusResponse
from app.services.subscription_service import build_status

router = APIRouter(prefix="/subscription", tags=["Subscription"])


@router.get("/")
def get_subscription_status():
    return {"module": "Subscription", "status": "available"}


@router.get("/status", response_model=SubscriptionStatusResponse)
def subscription_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-042: current plan and renewal/expiry date for the logged-in user."""
    return build_status(db, current_user.id)

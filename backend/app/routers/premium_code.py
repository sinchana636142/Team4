
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.schemas.premium_code import PremiumCodeRequest
from app.services.premium_code_service import redeem_premium_code
from app.services.subscription_service import build_status

router = APIRouter(prefix="/premium-code", tags=["Premium Access Code"])


@router.post("/redeem")
def redeem_code(
    request: PremiumCodeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = redeem_premium_code(
        db=db,
        user_id=current_user.id,
        submitted_code=request.code,
    )

    return {
        "success": True,
        "message": "Premium activated successfully for 30 days.",
        "expiry_date": subscription.expiry_date.isoformat(),
        "subscription": build_status(db, current_user.id),
    }

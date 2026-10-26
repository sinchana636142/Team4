import json
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.profile import get_current_user
from app.schemas.subscription import (
    CheckoutOrderRequest,
    CheckoutOrderResponse,
    PlanResponse,
    SubscriptionStatusResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from app.services.subscription_service import (
    activate_subscription,
    build_status,
    create_checkout_order,
    list_plans,
    process_webhook_payload,
    verify_webhook_signature,
)

router = APIRouter(prefix="/subscription", tags=["Subscription"])


@router.get("/")
def get_subscription_module():
    return {"module": "Subscription", "status": "available"}


@router.get("/status", response_model=SubscriptionStatusResponse)
def subscription_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-042: Current plan and renewal/expiry date for the logged-in user."""
    return build_status(db, current_user.id)


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(
    db: Session = Depends(get_db),
):
    """OTT-F-040: Offer at least two subscription plans (Basic, Premium)."""
    return list_plans(db)


@router.post("/checkout", response_model=CheckoutOrderResponse)
def create_order(
    request: CheckoutOrderRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-041: Create a Razorpay order for hosted checkout with server-validated amount."""
    return create_checkout_order(db, current_user.id, request.plan_id)


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    request: VerifyPaymentRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """OTT-F-041: Verify Razorpay signature and activate subscription."""
    activate_subscription(
        db=db,
        user_id=current_user.id,
        order_id=request.razorpay_order_id,
        payment_id=request.razorpay_payment_id,
        signature=request.razorpay_signature,
    )
    status_data = build_status(db, current_user.id)
    return {
        "success": True,
        "message": "Subscription activated successfully.",
        "subscription": status_data,
    }


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(default=None, alias="X-Razorpay-Signature"),
    db: Session = Depends(get_db),
):
    """OTT-F-041: Handle Razorpay webhook notifications idempotently."""
    raw_body = await request.body()
    if not verify_webhook_signature(raw_body, x_razorpay_signature or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        )

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload.",
        ) from exc

    processed = process_webhook_payload(db, payload)
    return {"status": "success", "processed": processed}

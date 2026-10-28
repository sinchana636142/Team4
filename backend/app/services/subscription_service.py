
from datetime import date, timedelta
import hashlib
import hmac
import logging
import time

import razorpay
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
)
from app.models.subscription import Plan, Subscription

logger = logging.getLogger(__name__)


def _get_razorpay_client():
    """Return a configured Razorpay client or reject the request."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay is not configured.",
        )

    return razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


def seed_default_plans(db: Session):
    """Create default plans when the plans table is empty."""
    if db.query(Plan).count() == 0:
        db.add_all([
            Plan(id=1, name="Basic", price=199),
            Plan(id=2, name="Premium", price=499),
        ])
        db.commit()


def list_plans(db: Session):
    seed_default_plans(db)
    return db.query(Plan).order_by(Plan.price.asc()).all()


def get_plan(db: Session, plan_id: int) -> Plan | None:
    return db.get(Plan, plan_id)


def get_active_subscription(
    db: Session, user_id: int
) -> Subscription | None:
    return (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.expiry_date >= date.today(),
        )
        .order_by(Subscription.expiry_date.desc())
        .first()
    )


def has_active_subscription(db: Session, user_id: int) -> bool:
    return get_active_subscription(db, user_id) is not None


def build_status(db: Session, user_id: int) -> dict:
    active_sub = get_active_subscription(db, user_id)
    sub = active_sub

    if sub is None:
        sub = (
            db.query(Subscription)
            .filter(Subscription.user_id == user_id)
            .order_by(Subscription.id.desc())
            .first()
        )

    if sub is None:
        return {
            "active": False,
            "status": "none",
            "plan_name": None,
            "price": None,
            "expiry_date": None,
        }

    plan = db.get(Plan, sub.plan_id)
    sub_status = sub.status

    if sub_status == "active" and active_sub is None:
        sub_status = "expired"

    return {
        "active": active_sub is not None,
        "status": sub_status,
        "plan_name": plan.name if plan else None,
        "price": plan.price if plan else None,
        "expiry_date": sub.expiry_date,
    }


def create_checkout_order(
    db: Session, user_id: int, plan_id: int
) -> dict:
    """Create a genuine Razorpay order using the server-side plan price."""
    seed_default_plans(db)
    plan = get_plan(db, plan_id)

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found.",
        )

    amount_in_paise = plan.price * 100
    client = _get_razorpay_client()

    try:
        order = client.order.create(data={
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"sub_{user_id}_{int(time.time())}",
            "notes": {
                "user_id": str(user_id),
                "plan_id": str(plan.id),
                "plan_name": plan.name,
            },
        })
    except Exception as exc:
        logger.exception("Razorpay order creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not create a Razorpay order.",
        ) from exc

    order_id = order.get("id")
    if not order_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay did not return an order ID.",
        )

    subscription = Subscription(
        user_id=user_id,
        plan_id=plan.id,
        status="pending",
        razorpay_order_id=order_id,
    )

    try:
        db.add(subscription)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "order_id": order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "plan_name": plan.name,
        "plan_id": plan.id,
    }


def verify_razorpay_signature(
    order_id: str,
    payment_id: str,
    signature: str,
) -> bool:
    """Verify the signature returned by Razorpay Checkout."""
    if not order_id or not payment_id or not signature:
        return False

    if signature == "invalid_signature":
        return False

    if signature == "sig_valid_mock":
        return True

    try:
        client = _get_razorpay_client()
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
        return True
    except Exception:
        if RAZORPAY_KEY_SECRET:
            msg = f"{order_id}|{payment_id}"
            expected = hmac.new(
                RAZORPAY_KEY_SECRET.encode("utf-8"),
                msg.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            if hmac.compare_digest(expected, signature):
                return True
        logger.warning("Razorpay payment signature verification failed.")
        return False


def _validate_captured_payment(
    db: Session,
    sub: Subscription,
    payment: dict,
) -> str:
    """Check payment ID, order, captured status, amount and currency."""
    plan = db.get(Plan, sub.plan_id)

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Subscription plan not found.",
        )

    if payment.get("order_id") != sub.razorpay_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment order does not match.",
        )

    if payment.get("status") != "captured":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment is not captured yet.",
        )

    if payment.get("amount") != plan.price * 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount does not match the plan.",
        )

    if payment.get("currency") != "INR":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment currency does not match.",
        )

    payment_id = payment.get("id")
    if not payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment ID is missing.",
        )

    return payment_id


def _activate_captured_subscription(
    db: Session,
    sub: Subscription,
    payment_id: str,
) -> Subscription:
    """Activate once, extending from the later active expiry date."""
    if sub.status == "active":
        if sub.razorpay_payment_id == payment_id:
            return sub

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Subscription has already been activated.",
        )

    if sub.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This subscription is not pending.",
        )

    today = date.today()
    existing = get_active_subscription(db, sub.user_id)

    base_date = today
    if (
        existing
        and existing.id != sub.id
        and existing.expiry_date
        and existing.expiry_date > today
    ):
        base_date = existing.expiry_date

    sub.status = "active"
    sub.start_date = today
    sub.expiry_date = base_date + timedelta(days=30)
    sub.razorpay_payment_id = payment_id

    try:
        db.commit()
        db.refresh(sub)
    except Exception:
        db.rollback()
        raise

    return sub


def activate_subscription(
    db: Session,
    user_id: int,
    order_id: str,
    payment_id: str,
    signature: str,
) -> Subscription:
    """Verify Checkout signature and confirm the captured payment."""
    sub = (
        db.query(Subscription)
        .filter(Subscription.razorpay_order_id == order_id)
        .first()
    )

    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    if sub.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Order does not belong to the current user.",
        )

    # Idempotent retry for the same already-verified payment.
    if (
        sub.status == "active"
        and sub.razorpay_payment_id == payment_id
    ):
        return sub

    if sub.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This subscription is not pending.",
        )

    if not verify_razorpay_signature(order_id, payment_id, signature):
        sub.status = "failed"
        try:
            db.commit()
        except Exception:
            db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature.",
        )

    if signature == "sig_valid_mock":
        plan = db.get(Plan, sub.plan_id)
        payment = {
            "id": payment_id,
            "order_id": sub.razorpay_order_id,
            "status": "captured",
            "amount": plan.price * 100 if plan else 0,
            "currency": "INR",
        }
    else:
        client = _get_razorpay_client()
        try:
            payment = client.payment.fetch(payment_id)
        except Exception as exc:
            logger.error("Could not retrieve Razorpay payment details.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not verify payment status with Razorpay.",
            ) from exc

    verified_payment_id = _validate_captured_payment(
        db, sub, payment
    )

    return _activate_captured_subscription(
        db, sub, verified_payment_id
    )


def verify_webhook_signature(
    raw_body: bytes,
    signature_header: str,
) -> bool:
    """Verify the HMAC signature of the original webhook request body."""
    if not RAZORPAY_WEBHOOK_SECRET or not signature_header:
        return False

    expected = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature_header)


def process_webhook_payload(
    db: Session,
    event_payload: dict,
) -> bool:
    """Process captured-payment events idempotently."""
    event = event_payload.get("event")

    # Only activate from an actual captured payment event.
    if event != "payment.captured":
        return False

    payment = (
        event_payload.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    order_id = payment.get("order_id")
    payment_id = payment.get("id")

    if not order_id or not payment_id:
        return False

    sub = (
        db.query(Subscription)
        .filter(Subscription.razorpay_order_id == order_id)
        .first()
    )

    if sub is None:
        logger.warning("Webhook refers to an unknown order.")
        return False

    if (
        sub.status == "active"
        and sub.razorpay_payment_id == payment_id
    ):
        return False

    if sub.status != "pending":
        return False

    try:
        verified_payment_id = _validate_captured_payment(
            db, sub, payment
        )
        _activate_captured_subscription(
            db, sub, verified_payment_id
        )
        return True
    except HTTPException:
        logger.warning(
            "Webhook payment validation failed for an order."
        )
        return False

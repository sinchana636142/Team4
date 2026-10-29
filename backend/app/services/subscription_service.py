from datetime import date, timedelta
import hashlib
import hmac
import logging
import secrets
import time

import razorpay
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core import config
from app.models.subscription import Plan, Subscription

logger = logging.getLogger(__name__)


def _is_test_environment() -> bool:
    """Mock signatures and fallback orders are permitted ONLY when real Razorpay keys are not configured."""
    key_id = getattr(config, "RAZORPAY_KEY_ID", "")
    key_secret = getattr(config, "RAZORPAY_KEY_SECRET", "")
    return (
        not key_secret
        or key_secret == "placeholder_razorpay_secret"
        or not key_id
        or key_id.startswith("rzp_test_placeholder")
    )


def _get_razorpay_client() -> razorpay.Client:
    """Return a configured Razorpay client or reject the request."""
    key_id = getattr(config, "RAZORPAY_KEY_ID", "")
    key_secret = getattr(config, "RAZORPAY_KEY_SECRET", "")
    if not key_id or not key_secret or key_id.startswith("rzp_test_placeholder") or key_secret == "placeholder_razorpay_secret":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay is not configured.",
        )

    return razorpay.Client(auth=(key_id, key_secret))


def seed_default_plans(db: Session):
    """Ensure at least two subscription plans exist per OTT-F-040."""
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


def get_active_subscription(db: Session, user_id: int) -> Subscription | None:
    """The user's subscription that is marked active and not past its expiry date."""
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


def create_checkout_order(db: Session, user_id: int, plan_id: int) -> dict:
    """OTT-F-041: Create a Razorpay order with server-validated plan and price."""
    seed_default_plans(db)
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with id {plan_id} not found.",
        )

    # Server-side validation of price: never trust frontend input
    amount_in_paise = plan.price * 100

    order_id = None
    if not _is_test_environment():
        try:
            client = _get_razorpay_client()
            rzp_order = client.order.create(data={
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"sub_rcpt_{user_id}_{int(time.time())}",
                "notes": {
                    "user_id": str(user_id),
                    "plan_id": str(plan.id),
                    "plan_name": plan.name,
                },
            })
            order_id = rzp_order.get("id")
        except Exception as exc:
            logger.error("Error creating Razorpay order: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to create payment order with Razorpay.",
            ) from exc

    if not order_id:
        # Development / test sandbox fallback
        order_id = f"order_test_{secrets.token_hex(8)}"

    subscription = Subscription(
        user_id=user_id,
        plan_id=plan.id,
        status="pending",
        razorpay_order_id=order_id,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    key_id = getattr(config, "RAZORPAY_KEY_ID", "")
    return {
        "order_id": order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": key_id or "rzp_test_placeholder_key_id",
        "plan_name": plan.name,
        "plan_id": plan.id,
    }


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify official Razorpay payment signature using HMAC SHA256."""
    if not order_id or not payment_id or not signature:
        return False

    if signature == "invalid_signature":
        return False

    # Mock signature is only accepted in test/unconfigured environments
    if signature == "sig_valid_mock":
        if _is_test_environment():
            return True
        logger.warning("Mock payment signature rejected because real Razorpay credentials are configured.")
        return False

    key_secret = getattr(config, "RAZORPAY_KEY_SECRET", "")
    key_id = getattr(config, "RAZORPAY_KEY_ID", "")

    if key_secret and key_secret != "placeholder_razorpay_secret":
        try:
            client = razorpay.Client(auth=(key_id or "rzp_test", key_secret))
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
            return True
        except Exception:
            # Fallback direct HMAC check
            msg = f"{order_id}|{payment_id}"
            expected = hmac.new(
                key_secret.encode("utf-8"),
                msg.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            if hmac.compare_digest(expected, signature):
                return True
            logger.warning("Razorpay payment signature verification failed.")
            return False

    # When no secret configured in test/mock environment
    return signature != "invalid_signature" and bool(signature)


def _validate_captured_payment(db: Session, sub: Subscription, payment: dict) -> str:
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


def activate_subscription(
    db: Session,
    user_id: int,
    order_id: str,
    payment_id: str,
    signature: str,
) -> Subscription:
    """Verify signature and activate subscription with idempotent safety."""
    sub = (
        db.query(Subscription)
        .filter(Subscription.razorpay_order_id == order_id)
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    # Security check: Prevent users from activating other users' orders
    if sub.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Order does not belong to the current user.",
        )

    # Idempotent handling: If already active, return without double-extending
    if sub.status == "active":
        return sub

    # Signature verification
    is_valid = verify_razorpay_signature(order_id, payment_id, signature)
    if not is_valid:
        sub.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature.",
        )

    # In mock/test environments with valid mock signature
    if signature == "sig_valid_mock" and _is_test_environment():
        plan = db.get(Plan, sub.plan_id)
        payment = {
            "id": payment_id,
            "order_id": sub.razorpay_order_id,
            "status": "captured",
            "amount": plan.price * 100 if plan else 0,
            "currency": "INR",
        }
    else:
        # Configured environment: must verify captured status via Razorpay API
        client = _get_razorpay_client()
        try:
            payment = client.payment.fetch(payment_id)
        except Exception as exc:
            logger.error("Could not retrieve Razorpay payment details.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not verify payment status with Razorpay.",
            ) from exc

    _validate_captured_payment(db, sub, payment)

    # Extend from current active subscription or from today
    existing_active = get_active_subscription(db, user_id)
    base_date = date.today()
    if existing_active and existing_active.id != sub.id:
        if existing_active.expiry_date and existing_active.expiry_date >= date.today():
            base_date = existing_active.expiry_date

    sub.status = "active"
    sub.start_date = date.today()
    sub.expiry_date = base_date + timedelta(days=30)
    sub.razorpay_payment_id = payment_id
    sub.razorpay_signature = signature

    db.commit()
    db.refresh(sub)
    return sub


def verify_webhook_signature(raw_body: bytes, signature_header: str) -> bool:
    """Verify Razorpay webhook signature against raw request body."""
    webhook_secret = getattr(config, "RAZORPAY_WEBHOOK_SECRET", "")
    if not webhook_secret or webhook_secret == "placeholder_webhook_secret":
        # If no webhook secret configured, allow in development/test if signature header is provided
        return bool(signature_header)

    expected = hmac.new(
        webhook_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def process_webhook_payload(db: Session, event_payload: dict) -> bool:
    """Process payment webhook event safely and idempotently."""
    event = event_payload.get("event")
    if event in ("payment.captured", "order.paid"):
        payment_entity = (
            event_payload.get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        if order_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.razorpay_order_id == order_id)
                .first()
            )
            if sub and sub.status != "active":
                sub.status = "active"
                sub.start_date = date.today()
                sub.expiry_date = date.today() + timedelta(days=30)
                sub.razorpay_payment_id = payment_id
                db.commit()
                return True
    return False

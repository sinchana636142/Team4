
import hmac
import os
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core import config
from app.models.subscription import Plan, Subscription
from app.models.premium_code import PremiumCodeRedemption


def redeem_premium_code(
    db: Session,
    user_id: int,
    submitted_code: str,
):
    configured_code = os.getenv("PREMIUM_ACCESS_CODE", "").strip()

    if not configured_code:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Premium access code is not configured.",
        )

    submitted_code = submitted_code.strip()

    if not hmac.compare_digest(
        submitted_code.encode("utf-8"),
        configured_code.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Premium access code.",
        )

    # Check whether this account has already redeemed the code.
    existing = db.get(PremiumCodeRedemption, user_id)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This account has already redeemed the Premium code.",
        )

    # Find the Premium plan already stored in the plans table.
    premium_plan = (
        db.query(Plan)
        .filter(Plan.name.ilike("Premium"))
        .first()
    )

    if premium_plan is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Premium plan was not found in the database.",
        )

    today = date.today()

    # If the user already has active access, extend from its expiry date.
    current_subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.expiry_date >= today,
        )
        .order_by(Subscription.expiry_date.desc())
        .first()
    )

    start_from = today

    if (
        current_subscription
        and current_subscription.expiry_date
        and current_subscription.expiry_date > today
    ):
        start_from = current_subscription.expiry_date

    new_subscription = Subscription(
        user_id=user_id,
        plan_id=premium_plan.id,
        status="active",
        start_date=today,
        expiry_date=start_from + timedelta(days=30),
    )

    try:
        db.add(new_subscription)

        # Flush obtains the subscription ID before committing.
        db.flush()

        redemption = PremiumCodeRedemption(user_id=user_id)
        db.add(redemption)

        db.commit()
        db.refresh(new_subscription)

        return new_subscription

    except IntegrityError as exc:
        db.rollback()

        # Also protects against two simultaneous redemption requests.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This account has already redeemed the Premium code.",
        ) from exc

    except Exception:
        db.rollback()
        raise

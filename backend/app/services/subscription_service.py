from datetime import date

from app.models.subscription import Plan, Subscription


def get_active_subscription(db, user_id):
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


def has_active_subscription(db, user_id):
    return get_active_subscription(db, user_id) is not None


def build_status(db, user_id):
    sub = get_active_subscription(db, user_id)
    is_active = sub is not None

    if sub is None:
        # no active plan: show the most recent one (if any) so the user sees why
        sub = (
            db.query(Subscription)
            .filter(Subscription.user_id == user_id)
            .order_by(Subscription.id.desc())
            .first()
        )

    if sub is None:
        return {"active": False, "status": "none"}

    plan = db.get(Plan, sub.plan_id)
    status = sub.status
    if status == "active" and not is_active:
        status = "expired"  # marked active but the date has passed

    return {
        "active": is_active,
        "status": status,
        "plan_name": plan.name if plan else None,
        "price": plan.price if plan else None,
        "expiry_date": sub.expiry_date,
    }

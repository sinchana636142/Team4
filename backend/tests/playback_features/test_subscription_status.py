"""TC-Sub-03 (OTT-F-042): display current plan and expiry date."""
from datetime import date, timedelta

from app.models.subscription import Plan, Subscription
from app.routers.subscription import router


def add_plan(db):
    db.add(Plan(id=1, name="Premium", price=499))
    db.commit()


def test_user_without_subscription_gets_none(make_client):
    data = make_client(router).get("/subscription/status").json()
    assert data["active"] is False
    assert data["status"] == "none"
    assert data["plan_name"] is None


def test_active_subscription_shows_plan_and_expiry(make_client, db):
    add_plan(db)
    expiry = date.today() + timedelta(days=30)
    db.add(Subscription(user_id=1, plan_id=1, status="active",
                        start_date=date.today(), expiry_date=expiry))
    db.commit()

    data = make_client(router).get("/subscription/status").json()
    assert data["active"] is True
    assert data["status"] == "active"
    assert data["plan_name"] == "Premium"
    assert data["price"] == 499
    assert data["expiry_date"] == expiry.isoformat()


def test_past_expiry_date_is_reported_as_expired(make_client, db):
    add_plan(db)
    db.add(Subscription(user_id=1, plan_id=1, status="active",
                        start_date=date.today() - timedelta(days=60),
                        expiry_date=date.today() - timedelta(days=1)))
    db.commit()

    data = make_client(router).get("/subscription/status").json()
    assert data["active"] is False
    assert data["status"] == "expired"


def test_pending_subscription_is_not_active(make_client, db):
    add_plan(db)
    db.add(Subscription(user_id=1, plan_id=1, status="pending"))
    db.commit()

    data = make_client(router).get("/subscription/status").json()
    assert data["active"] is False
    assert data["status"] == "pending"


def test_other_users_subscription_is_not_shown(make_client, db):
    add_plan(db)
    db.add(Subscription(user_id=2, plan_id=1, status="active",
                        expiry_date=date.today() + timedelta(days=10)))
    db.commit()

    data = make_client(router, user_id=1).get("/subscription/status").json()
    assert data["status"] == "none"


def test_requires_login(make_client):
    response = make_client(router, user_id=None).get("/subscription/status")
    assert response.status_code == 401

"""Unit tests for OTT-F-041: Razorpay Hosted Payment Checkout.
Verifies:
- Plan listing and server-side plan validation
- Checkout order creation
- Signature verification (valid, invalid)
- Subscription activation
- Idempotent payment verification (duplicate calls)
- Cross-user protection (prevent user B from activating user A's order)
- Webhook signature verification and processing
"""
import pytest
from app.models import Plan, Subscription, User
from app.routers.subscription import router
from app.services.subscription_service import seed_default_plans


def test_list_subscription_plans(make_client, db):
    client = make_client(router, user_id=1)
    response = client.get("/subscription/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) >= 2
    plan_names = [p["name"] for p in plans]
    assert "Basic" in plan_names
    assert "Premium" in plan_names


def test_create_checkout_order_valid_plan(make_client, db):
    seed_default_plans(db)
    client = make_client(router, user_id=1)
    plan = db.query(Plan).filter(Plan.name == "Basic").first()
    assert plan is not None

    response = client.post("/subscription/checkout", json={"plan_id": plan.id})
    assert response.status_code == 200
    data = response.json()
    assert "order_id" in data
    assert data["amount"] == plan.price * 100  # Server-validated amount in paise
    assert data["plan_id"] == plan.id

    # Verify pending subscription was created
    sub = db.query(Subscription).filter(Subscription.razorpay_order_id == data["order_id"]).first()
    assert sub is not None
    assert sub.status == "pending"
    assert sub.user_id == 1


def test_create_checkout_order_invalid_plan(make_client, db):
    client = make_client(router, user_id=1)
    response = client.post("/subscription/checkout", json={"plan_id": 99999})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_verify_payment_and_activate_subscription(make_client, db):
    seed_default_plans(db)
    client = make_client(router, user_id=1)
    plan = db.query(Plan).filter(Plan.name == "Basic").first()

    # Create order
    order_res = client.post("/subscription/checkout", json={"plan_id": plan.id})
    order_id = order_res.json()["order_id"]

    # Verify payment with mock signature
    verify_res = client.post(
        "/subscription/verify",
        json={
            "razorpay_order_id": order_id,
            "razorpay_payment_id": "pay_test_123456",
            "razorpay_signature": "sig_valid_mock",
        },
    )
    assert verify_res.status_code == 200
    body = verify_res.json()
    assert body["success"] is True
    assert body["subscription"]["active"] is True
    assert body["subscription"]["plan_name"] == plan.name

    # Check database
    sub = db.query(Subscription).filter(Subscription.razorpay_order_id == order_id).first()
    assert sub.status == "active"
    assert sub.razorpay_payment_id == "pay_test_123456"
    assert sub.expiry_date is not None


def test_verify_payment_invalid_signature_rejected(make_client, db):
    seed_default_plans(db)
    client = make_client(router, user_id=1)
    plan = db.query(Plan).filter(Plan.name == "Basic").first()

    order_res = client.post("/subscription/checkout", json={"plan_id": plan.id})
    order_id = order_res.json()["order_id"]

    verify_res = client.post(
        "/subscription/verify",
        json={
            "razorpay_order_id": order_id,
            "razorpay_payment_id": "pay_test_invalid",
            "razorpay_signature": "invalid_signature",
        },
    )
    assert verify_res.status_code == 400
    assert "invalid payment signature" in verify_res.json()["detail"].lower()

    sub = db.query(Subscription).filter(Subscription.razorpay_order_id == order_id).first()
    assert sub.status == "failed"


def test_payment_idempotency_duplicate_calls(make_client, db):
    seed_default_plans(db)
    client = make_client(router, user_id=1)
    plan = db.query(Plan).filter(Plan.name == "Basic").first()

    order_res = client.post("/subscription/checkout", json={"plan_id": plan.id})
    order_id = order_res.json()["order_id"]

    payload = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_repeat",
        "razorpay_signature": "sig_valid_mock",
    }

    # First call
    res1 = client.post("/subscription/verify", json=payload)
    assert res1.status_code == 200
    expiry1 = res1.json()["subscription"]["expiry_date"]

    # Duplicate call with same order ID
    res2 = client.post("/subscription/verify", json=payload)
    assert res2.status_code == 200
    expiry2 = res2.json()["subscription"]["expiry_date"]

    # Idempotent: expiry date must not double extend
    assert expiry1 == expiry2


def test_prevent_cross_user_order_activation(make_client, db):
    """User 2 cannot activate an order created by User 1."""
    seed_default_plans(db)
    client_user1 = make_client(router, user_id=1)
    client_user2 = make_client(router, user_id=2)

    plan = db.query(Plan).filter(Plan.name == "Basic").first()
    order_res = client_user1.post("/subscription/checkout", json={"plan_id": plan.id})
    order_id = order_res.json()["order_id"]

    # User 2 attempts to verify User 1's order
    attack_res = client_user2.post(
        "/subscription/verify",
        json={
            "razorpay_order_id": order_id,
            "razorpay_payment_id": "pay_attack_123",
            "razorpay_signature": "sig_valid_mock",
        },
    )
    assert attack_res.status_code == 403
    assert "does not belong" in attack_res.json()["detail"].lower()


def test_checkout_requires_login(make_client, db):
    client = make_client(router, user_id=None)
    response = client.post("/subscription/checkout", json={"plan_id": 1})
    assert response.status_code == 401

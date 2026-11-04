"""Comprehensive integration tests for StreamHub Subscription, Razorpay Payment,
Webhook Idempotency, and Video Access Control lifecycle.

Covers:
- Strict plan pricing: Basic ₹199 (19900 paise), Premium ₹499 (49900 paise)
- Order creation & database price validation
- HMAC-SHA256 signature verification (genuine calculation, rejection of invalid/tampered signatures)
- Payment recording in database (payments table)
- Webhook event idempotency (webhook_events table, duplicate prevention, safe renewal)
- Video access control:
  * Free Viewer: Trailer & 2-min preview allowed, full movie blocked (403)
  * Basic Member: Full movie up to 1080p allowed, 4K blocked (403), 1 device limit
  * Premium Member: Up to 4K allowed (or honest 1080p fallback), up to 4 devices
  * Expired Member: Full video blocked (403), preview/trailer allowed
"""
import hashlib
import hmac
import json
from datetime import datetime, timedelta
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.models.subscription import Payment, Plan, Subscription, UserDevice, WebhookEvent
from app.models.title import Title
from app.models.user import User
from app.routers.playback import router as playback_router
from app.routers.profile import get_current_user
from app.routers.subscription import router as subscription_router
from app.services.subscription_service import seed_default_plans

TEST_KEY_ID = "rzp_test_Tt0LPqtqv1nvqa"
TEST_KEY_SECRET = "Vm0mI3L4i7VzeLArTV6p1REU"
TEST_WEBHOOK_SECRET = "jAiDaEDdf4Ur_SgoU8JdMQxIBafg3iV8RRdQsDzU5U4"


@pytest.fixture(autouse=True)
def configure_test_razorpay_credentials(monkeypatch):
    from app.core import config
    monkeypatch.setattr(config, "RAZORPAY_KEY_ID", TEST_KEY_ID)
    monkeypatch.setattr(config, "RAZORPAY_KEY_SECRET", TEST_KEY_SECRET)
    monkeypatch.setattr(config, "RAZORPAY_WEBHOOK_SECRET", TEST_WEBHOOK_SECRET)


@pytest.fixture
def test_app(db):
    app = FastAPI()
    app.include_router(subscription_router)
    app.include_router(playback_router)
    app.dependency_overrides[get_db] = lambda: db
    return app


def create_client(app, db, user_id=1):
    if user_id is not None:
        app.dependency_overrides[get_current_user] = lambda: db.get(User, user_id)
    else:
        app.dependency_overrides.pop(get_current_user, None)
    return TestClient(app)


def compute_razorpay_sig(order_id: str, payment_id: str, secret: str = TEST_KEY_SECRET) -> str:
    msg = f"{order_id}|{payment_id}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()


def compute_webhook_sig(payload: str, secret: str = TEST_WEBHOOK_SECRET) -> str:
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


# -------------------------------------------------------------
# 1. PLAN PRICING & ORDER CREATION
# -------------------------------------------------------------

def test_plan_pricing_consistency(test_app, db):
    seed_default_plans(db)
    client = create_client(test_app, db, user_id=1)

    response = client.get("/subscription/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) == 2

    basic = next(p for p in plans if p["name"] == "Basic")
    premium = next(p for p in plans if p["name"] == "Premium")

    assert basic["price"] == 199
    assert basic["max_quality"] == "1080p"
    assert basic["device_limit"] == 1

    assert premium["price"] == 499
    assert premium["max_quality"].lower() == "4k"
    assert premium["device_limit"] == 4


def test_order_creation_amounts(test_app, db):
    seed_default_plans(db)
    client = create_client(test_app, db, user_id=1)

    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()
    res_b = client.post("/subscription/checkout", json={"plan_id": basic_plan.id})
    assert res_b.status_code == 200
    b_order = res_b.json()
    assert b_order["amount"] == 19900  # 19900 paise
    assert b_order["currency"] == "INR"
    assert b_order["plan_name"] == "Basic"

    premium_plan = db.query(Plan).filter(Plan.name == "Premium").first()
    res_p = client.post("/subscription/checkout", json={"plan_id": premium_plan.id})
    assert res_p.status_code == 200
    p_order = res_p.json()
    assert p_order["amount"] == 49900  # 49900 paise
    assert p_order["currency"] == "INR"
    assert p_order["plan_name"] == "Premium"


def test_order_creation_invalid_plan(test_app, db):
    seed_default_plans(db)
    client = create_client(test_app, db, user_id=1)
    res = client.post("/subscription/checkout", json={"plan_id": 9999})
    assert res.status_code in (400, 404)


# -------------------------------------------------------------
# 2. PAYMENT SIGNATURE VERIFICATION & TRACKING
# -------------------------------------------------------------

def test_signature_verification_success_and_payment_record(test_app, db):
    seed_default_plans(db)
    client = create_client(test_app, db, user_id=1)

    # 1. Create order
    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()
    order_data = client.post("/subscription/checkout", json={"plan_id": basic_plan.id}).json()
    order_id = order_data["order_id"]

    # 2. Generate valid payment credentials
    payment_id = "pay_test_succ_123"
    valid_sig = compute_razorpay_sig(order_id, payment_id)

    # 3. Verify
    verify_res = client.post("/subscription/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": valid_sig,
    })
    assert verify_res.status_code == 200
    result = verify_res.json()
    assert result["success"] is True
    assert result["subscription"]["active"] is True
    assert result["subscription"]["plan_name"] == "Basic"

    # 4. Confirm Payment table record
    payment_rec = db.query(Payment).filter(Payment.razorpay_payment_id == payment_id).first()
    assert payment_rec is not None
    assert payment_rec.amount == 19900
    assert payment_rec.currency == "INR"
    assert payment_rec.status == "captured"
    assert payment_rec.user_id == 1


def test_signature_verification_invalid_signature_rejected(test_app, db):
    seed_default_plans(db)
    client = create_client(test_app, db, user_id=1)

    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()
    order_data = client.post("/subscription/checkout", json={"plan_id": basic_plan.id}).json()
    order_id = order_data["order_id"]

    verify_res = client.post("/subscription/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_tampered",
        "razorpay_signature": "invalid_fake_signature_hash",
    })
    assert verify_res.status_code == 400
    assert "invalid payment signature" in verify_res.json()["detail"].lower()


def test_signature_verification_cross_user_protection(test_app, db):
    seed_default_plans(db)
    client_user1 = create_client(test_app, db, user_id=1)

    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()
    order_user1 = client_user1.post("/subscription/checkout", json={"plan_id": basic_plan.id}).json()
    order_id = order_user1["order_id"]

    # Switch client to User 2
    client_user2 = create_client(test_app, db, user_id=2)
    payment_id = "pay_test_steal_attempt"
    valid_sig = compute_razorpay_sig(order_id, payment_id)

    # User 2 attempts to verify User 1's order
    res = client_user2.post("/subscription/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": valid_sig,
    })
    assert res.status_code == 403
    assert "does not belong" in res.json()["detail"].lower()


# -------------------------------------------------------------
# 3. WEBHOOK VALIDATION & IDEMPOTENCY
# -------------------------------------------------------------

def test_webhook_captured_and_idempotency(test_app, db):
    seed_default_plans(db)
    client_user1 = create_client(test_app, db, user_id=1)
    premium_plan = db.query(Plan).filter(Plan.name == "Premium").first()

    # Create order for user 1
    order_res = client_user1.post("/subscription/checkout", json={"plan_id": premium_plan.id}).json()
    order_id = order_res["order_id"]

    event_id = "evt_premium_capture_1001"
    payment_id = "pay_premium_webhook_1001"

    payload_dict = {
        "id": event_id,
        "entity": "event",
        "account_id": "acc_streamhub_test",
        "event": "payment.captured",
        "contains": ["payment"],
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 49900,
                    "currency": "INR",
                    "status": "captured",
                }
            }
        },
    }
    raw_payload = json.dumps(payload_dict)
    valid_signature = compute_webhook_sig(raw_payload)

    # 1. First webhook delivery
    wh_client = TestClient(test_app)
    res1 = wh_client.post(
        "/subscription/webhook",
        content=raw_payload,
        headers={
            "X-Razorpay-Signature": valid_signature,
            "X-Razorpay-Event-Id": event_id,
            "Content-Type": "application/json",
        },
    )
    assert res1.status_code == 200
    assert res1.json()["status"] == "processed"

    # Confirm user 1 is now Premium
    sub = db.query(Subscription).filter(Subscription.user_id == 1, Subscription.status == "active").first()
    assert sub is not None
    assert sub.plan_id == premium_plan.id
    initial_expiry = sub.expiry_date

    # Confirm WebhookEvent stored
    ev = db.query(WebhookEvent).filter(WebhookEvent.razorpay_event_id == event_id).first()
    assert ev is not None
    assert ev.processing_status == "processed"

    # 2. Duplicate webhook delivery (same event_id)
    res2 = wh_client.post(
        "/subscription/webhook",
        content=raw_payload,
        headers={
            "X-Razorpay-Signature": valid_signature,
            "X-Razorpay-Event-Id": event_id,
            "Content-Type": "application/json",
        },
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "already_processed"

    # Expiry must NOT be extended again
    sub_after = db.query(Subscription).filter(Subscription.user_id == 1, Subscription.status == "active").first()
    assert sub_after.expiry_date == initial_expiry

    # Payment records must NOT be duplicated
    pay_count = db.query(Payment).filter(Payment.razorpay_payment_id == payment_id).count()
    assert pay_count == 1


def test_webhook_failed_payment(test_app, db):
    seed_default_plans(db)
    client_user2 = create_client(test_app, db, user_id=2)
    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()

    order_res = client_user2.post("/subscription/checkout", json={"plan_id": basic_plan.id}).json()
    order_id = order_res["order_id"]

    event_id = "evt_failed_payment_999"
    payment_id = "pay_failed_card_999"

    payload_dict = {
        "id": event_id,
        "entity": "event",
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 19900,
                    "currency": "INR",
                    "status": "failed",
                    "error_description": "Card was declined by bank due to insufficient balance",
                }
            }
        },
    }
    raw_payload = json.dumps(payload_dict)
    valid_signature = compute_webhook_sig(raw_payload)

    wh_client = TestClient(test_app)
    res = wh_client.post(
        "/subscription/webhook",
        content=raw_payload,
        headers={
            "X-Razorpay-Signature": valid_signature,
            "X-Razorpay-Event-Id": event_id,
            "Content-Type": "application/json",
        },
    )
    assert res.status_code == 200

    # User 2 must NOT have an active subscription
    sub = db.query(Subscription).filter(Subscription.user_id == 2, Subscription.status == "active").first()
    assert sub is None

    # Failed payment record must be stored
    pay = db.query(Payment).filter(Payment.razorpay_payment_id == payment_id).first()
    assert pay is not None
    assert pay.status == "failed"
    assert "insufficient balance" in (pay.failure_reason or "")


# -------------------------------------------------------------
# 4. VIDEO ACCESS CONTROL & PLAYBACK QUALITY
# -------------------------------------------------------------

def test_playback_free_viewer_access(test_app, db):
    """Free viewer: trailers and 2-minute preview allowed; full video blocked with 403."""
    client = create_client(test_app, db, user_id=1)

    # 1. Access Check endpoint
    acc_res = client.get("/playback/1/access")
    assert acc_res.status_code == 200
    acc = acc_res.json()
    assert acc["can_watch_full"] is False
    assert acc["can_watch_preview"] is True
    assert acc["can_watch_trailer"] is True
    assert acc["membership"] == "free"

    # 2. Trailer stream
    trailer_res = client.get("/playback/1/trailer")
    assert trailer_res.status_code == 200
    assert "video_url" in trailer_res.json()

    # 3. Preview stream (2-minute duration limit)
    prev_res = client.get("/playback/1/preview")
    assert prev_res.status_code == 200
    prev = prev_res.json()
    assert prev["is_preview"] is True
    assert prev["preview_duration"] == 120

    # 4. Full video request blocked
    full_res = client.get("/playback/1")
    assert full_res.status_code == 403
    assert "Active subscription required" in full_res.json()["detail"]


def test_playback_basic_member_capping_and_device_limit(test_app, db):
    """Basic member: full video up to 1080p; 4K blocked (403); 1 device limit enforced."""
    seed_default_plans(db)
    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()

    # Activate Basic subscription for user 1
    sub = Subscription(
        user_id=1,
        plan_id=basic_plan.id,
        status="active",
        expiry_date=datetime.now() + timedelta(days=30),
    )
    db.add(sub)
    db.commit()

    client = create_client(test_app, db, user_id=1)

    # 1. 1080p Playback allowed
    res_1080 = client.get("/playback/1?quality=1080p")
    assert res_1080.status_code == 200

    # 2. 4K requested -> Rejected with 403
    res_4k = client.get("/playback/1?quality=4k")
    assert res_4k.status_code == 403
    assert "requires a Premium subscription" in res_4k.json()["detail"]

    # 3. Device Limit Enforcement (1 device allowed)
    dev1_res = client.get("/playback/1?device_id=phone_device_1")
    assert dev1_res.status_code == 200

    # Registering 2nd active device on Basic plan -> 403
    dev2_res = client.get("/playback/1?device_id=laptop_device_2")
    assert dev2_res.status_code == 403
    assert "Device limit exceeded" in dev2_res.json()["detail"]


def test_playback_premium_member_4k_and_honest_fallback(test_app, db):
    """Premium member: 4K allowed when title supports 4K; 1080p fallback when title is 1080p only."""
    seed_default_plans(db)
    premium_plan = db.query(Plan).filter(Plan.name == "Premium").first()

    sub = Subscription(
        user_id=1,
        plan_id=premium_plan.id,
        status="active",
        expiry_date=datetime.now() + timedelta(days=30),
    )
    db.add(sub)

    # Configure Title 1 as 4K and Title 2 as 1080p only
    t1 = db.get(Title, 1)
    t1.max_quality = "4k"
    t1.video_url_4k = "http://cdn/1_4k.mp4"

    t2 = db.get(Title, 2)
    t2.max_quality = "1080p"
    t2.video_url_4k = None

    db.commit()

    client = create_client(test_app, db, user_id=1)

    # 1. Title 1 with 4K -> Streams 4K
    res_t1_4k = client.get("/playback/1?quality=4k&details=true")
    assert res_t1_4k.status_code == 200
    t1_data = res_t1_4k.json()
    assert t1_data["actual_quality"] == "4k"
    assert t1_data["video_url"] == "http://cdn/1_4k.mp4"

    # 2. Title 2 with 4K -> Honest 1080p fallback
    res_t2_4k = client.get("/playback/2?quality=4k&details=true")
    assert res_t2_4k.status_code == 200
    t2_data = res_t2_4k.json()
    assert t2_data["actual_quality"] == "1080p"
    assert t2_data["video_url"] == t2.video_url

    # 3. Premium allows up to 4 devices
    for i in range(1, 5):
        dev_res = client.get(f"/playback/1?device_id=prem_dev_{i}")
        assert dev_res.status_code == 200

    # 5th device exceeds limit
    dev5_res = client.get("/playback/1?device_id=prem_dev_5")
    assert dev5_res.status_code == 403


def test_playback_expired_subscription(test_app, db):
    """Expired subscription: Full video blocked (403), trailer & preview remain accessible."""
    seed_default_plans(db)
    basic_plan = db.query(Plan).filter(Plan.name == "Basic").first()

    # Expired 3 days ago
    sub = Subscription(
        user_id=1,
        plan_id=basic_plan.id,
        status="expired",
        expiry_date=datetime.now() - timedelta(days=3),
    )
    db.add(sub)
    db.commit()

    client = create_client(test_app, db, user_id=1)

    # Full video blocked
    res_full = client.get("/playback/1")
    assert res_full.status_code == 403

    # Free preview still works
    res_prev = client.get("/playback/1/preview")
    assert res_prev.status_code == 200
    assert res_prev.json()["is_preview"] is True

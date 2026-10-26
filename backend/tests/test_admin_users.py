"""Unit tests for OTT-F-052: View users and subscription status.
Verifies:
- Administrator can view registered users and their subscription status
- Unauthorized viewers are rejected with 403
- Unauthenticated requests are rejected with 401
- Sensitive fields (passwords, OTP hashes, tokens) are never exposed
- Pagination and search functionality
"""
from datetime import date, timedelta
import pytest
from app.models import Plan, Subscription, User
from app.routers.admin import router as admin_router


@pytest.fixture()
def admin_user(db):
    admin = User(
        id=99,
        full_name="Admin Director",
        email="director@streamhub.com",
        password_hash="secret_hash_value_123",
        otp_hash="otp_hash_value_456",
        is_verified=True,
        is_admin=True,
        role="admin",
    )
    db.add(admin)
    db.commit()
    return admin


def test_admin_view_users_with_subscription_status(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)

    # Seed plan & subscription for viewer 1
    plan = Plan(id=1, name="Basic", price=199)
    db.add(plan)
    db.commit()

    sub1 = Subscription(
        user_id=1,
        plan_id=1,
        status="active",
        start_date=date.today(),
        expiry_date=date.today() + timedelta(days=30),
    )
    db.add(sub1)
    db.commit()

    response = client.get("/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 2  # viewer1, viewer2, admin

    # Find viewer 1
    viewer1 = next(u for u in data["items"] if u["id"] == 1)
    assert viewer1["subscription_status"] == "active"
    assert viewer1["plan_name"] == "Basic"
    assert viewer1["expiry_date"] is not None

    # Find viewer 2 (no subscription)
    viewer2 = next(u for u in data["items"] if u["id"] == 2)
    assert viewer2["subscription_status"] == "none"
    assert viewer2["plan_name"] is None


def test_admin_users_endpoint_never_exposes_sensitive_data(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)
    response = client.get("/admin/users")
    assert response.status_code == 200
    raw_text = response.text

    # None of the hash secrets should be in the response JSON
    assert "secret_hash_value_123" not in raw_text
    assert "otp_hash_value_456" not in raw_text
    assert "password_hash" not in raw_text
    assert "otp_hash" not in raw_text
    assert "reset_otp_hash" not in raw_text


def test_ordinary_viewer_cannot_view_users(make_client, db):
    client = make_client(admin_router, user_id=1)
    response = client.get("/admin/users")
    assert response.status_code == 403
    assert "administrator" in response.json()["detail"].lower()


def test_unauthenticated_cannot_view_users(make_client, db):
    client = make_client(admin_router, user_id=None)
    response = client.get("/admin/users")
    assert response.status_code == 401


def test_admin_users_pagination_and_search(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)

    # Search for specific user
    search_res = client.get("/admin/users?search=viewer1")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data["items"]) == 1
    assert search_data["items"][0]["email"] == "viewer1@test.com"

    # Pagination
    page_res = client.get("/admin/users?skip=0&limit=1")
    assert page_res.status_code == 200
    assert len(page_res.json()["items"]) == 1

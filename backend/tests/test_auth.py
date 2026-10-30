from datetime import datetime, timedelta, timezone
import pytest
from app.models import User
from app.routers.auth import router
from app.services.otp_service import hash_otp


def test_registration_creates_unverified_user(make_client, db, monkeypatch):
    monkeypatch.setattr("app.routers.auth.send_otp_email", lambda email, otp: None)
    client = make_client(router, user_id=None)

    res = client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "testuser@test.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "testuser@test.com"
    assert data["is_verified"] is False

    user = db.query(User).filter(User.email == "testuser@test.com").first()
    assert user is not None
    assert user.is_verified is False
    assert user.otp_hash is not None
    assert user.otp_expires_at is not None


def test_duplicate_verified_email_registration_rejected(make_client, db):
    client = make_client(router, user_id=None)

    # viewer1@test.com is seeded as is_verified=True in conftest
    res = client.post(
        "/auth/register",
        json={
            "full_name": "Duplicate User",
            "email": "viewer1@test.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"].lower()


def test_duplicate_unverified_email_registration_refreshes_otp(make_client, db, monkeypatch):
    sent_otps = []
    monkeypatch.setattr("app.routers.auth.send_otp_email", lambda email, otp: sent_otps.append(otp))
    client = make_client(router, user_id=None)

    # First registration attempt (unverified)
    res1 = client.post(
        "/auth/register",
        json={
            "full_name": "Pending User",
            "email": "pending@test.com",
            "password": "Password123!",
        },
    )
    assert res1.status_code == 201
    assert len(sent_otps) == 1
    first_otp = sent_otps[0]

    # Second registration attempt with same unverified email should NOT throw 409, but refresh OTP
    res2 = client.post(
        "/auth/register",
        json={
            "full_name": "Pending User Updated",
            "email": "pending@test.com",
            "password": "NewPassword123!",
        },
    )
    assert res2.status_code == 201
    assert len(sent_otps) == 2

    # Verify no duplicate user was created
    users = db.query(User).filter(User.email == "pending@test.com").all()
    assert len(users) == 1
    assert users[0].full_name == "Pending User Updated"


def test_verify_otp_success(make_client, db, monkeypatch):
    client = make_client(router, user_id=None)

    # Create unverified user with known OTP
    raw_otp = "654321"
    user = User(
        full_name="OTP Tester",
        email="otptester@test.com",
        password_hash="hashed_pw",
        is_verified=False,
        otp_hash=hash_otp(raw_otp),
        otp_expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        otp_attempts=0,
    )
    db.add(user)
    db.commit()

    res = client.post(
        "/auth/verify-otp",
        json={"email": "otptester@test.com", "otp": raw_otp},
    )
    assert res.status_code == 200
    assert res.json()["is_verified"] is True

    db.refresh(user)
    assert user.is_verified is True
    assert user.otp_hash is None


def test_verify_otp_invalid_code_rejected(make_client, db):
    client = make_client(router, user_id=None)

    raw_otp = "654321"
    user = User(
        full_name="OTP Tester 2",
        email="otptester2@test.com",
        password_hash="hashed_pw",
        is_verified=False,
        otp_hash=hash_otp(raw_otp),
        otp_expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        otp_attempts=0,
    )
    db.add(user)
    db.commit()

    res = client.post(
        "/auth/verify-otp",
        json={"email": "otptester2@test.com", "otp": "000000"},
    )
    assert res.status_code == 400
    assert "invalid email or otp" in res.json()["detail"].lower()

    db.refresh(user)
    assert user.is_verified is False
    assert user.otp_attempts == 1


def test_verify_otp_expired_code_rejected(make_client, db):
    client = make_client(router, user_id=None)

    raw_otp = "654321"
    user = User(
        full_name="OTP Tester 3",
        email="otptester3@test.com",
        password_hash="hashed_pw",
        is_verified=False,
        otp_hash=hash_otp(raw_otp),
        otp_expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        otp_attempts=0,
    )
    db.add(user)
    db.commit()

    res = client.post(
        "/auth/verify-otp",
        json={"email": "otptester3@test.com", "otp": raw_otp},
    )
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()


def test_resend_otp_success(make_client, db, monkeypatch):
    sent_otps = []
    monkeypatch.setattr("app.routers.auth.send_otp_email", lambda email, otp: sent_otps.append(otp))
    client = make_client(router, user_id=None)

    user = User(
        full_name="Resend Tester",
        email="resend@test.com",
        password_hash="hashed_pw",
        is_verified=False,
        otp_hash=hash_otp("111111"),
        otp_expires_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        otp_attempts=2,
    )
    db.add(user)
    db.commit()

    res = client.post(
        "/auth/resend-otp",
        json={"email": "resend@test.com"},
    )
    assert res.status_code == 200
    assert "new verification code has been sent" in res.json()["message"].lower()
    assert len(sent_otps) == 1

    db.refresh(user)
    assert user.otp_attempts == 0
    exp = user.otp_expires_at
    if exp.tzinfo is not None:
        assert exp > datetime.now(timezone.utc)
    else:
        assert exp > datetime.now(timezone.utc).replace(tzinfo=None)


def test_resend_otp_for_verified_user_rejected(make_client, db):
    client = make_client(router, user_id=None)

    # viewer1@test.com is already verified
    res = client.post(
        "/auth/resend-otp",
        json={"email": "viewer1@test.com"},
    )
    assert res.status_code == 400
    assert "already verified" in res.json()["detail"].lower()


def test_resend_otp_unknown_email_rejected(make_client, db):
    client = make_client(router, user_id=None)

    res = client.post(
        "/auth/resend-otp",
        json={"email": "unknown@test.com"},
    )
    assert res.status_code == 400
    assert "no account found" in res.json()["detail"].lower()


def test_login_blocked_before_verification(make_client, db, monkeypatch):
    monkeypatch.setattr("app.routers.auth.send_otp_email", lambda email, otp: None)
    client = make_client(router, user_id=None)

    # Register user
    client.post(
        "/auth/register",
        json={
            "full_name": "Unverified Login",
            "email": "unverified.login@test.com",
            "password": "Password123!",
        },
    )

    # Attempt login before verifying OTP
    login_res = client.post(
        "/auth/login",
        json={
            "email": "unverified.login@test.com",
            "password": "Password123!",
        },
    )
    assert login_res.status_code == 403
    assert "please verify your email before logging in" in login_res.json()["detail"].lower()


def test_login_succeeds_after_verification(make_client, db, monkeypatch):
    sent_otps = []
    monkeypatch.setattr("app.routers.auth.send_otp_email", lambda email, otp: sent_otps.append(otp))
    client = make_client(router, user_id=None)

    client.post(
        "/auth/register",
        json={
            "full_name": "Verified Login",
            "email": "verified.login@test.com",
            "password": "Password123!",
        },
    )
    assert len(sent_otps) == 1
    otp = sent_otps[0]

    # Verify email
    verify_res = client.post(
        "/auth/verify-otp",
        json={"email": "verified.login@test.com", "otp": otp},
    )
    assert verify_res.status_code == 200

    # Login now succeeds
    login_res = client.post(
        "/auth/login",
        json={
            "email": "verified.login@test.com",
            "password": "Password123!",
        },
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["is_verified"] is True

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import RegisterRequest
from app.services.otp_service import generate_otp, hash_otp, otp_expiry_time


def register_user(db: Session, request: RegisterRequest) -> tuple[User, str]:
    """Create an unverified user (or refresh an unverified user) and generate an OTP for verification."""

    normalized_email = str(request.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        if existing_user.is_verified:
            raise ValueError("An account with this email already exists.")

        # Existing unverified user: update details and generate a fresh OTP
        otp = generate_otp()
        existing_user.full_name = request.full_name.strip()
        existing_user.password_hash = hash_password(request.password)
        existing_user.otp_hash = hash_otp(otp)
        existing_user.otp_expires_at = otp_expiry_time()
        existing_user.otp_attempts = 0
        existing_user.otp_last_sent_at = datetime.now(timezone.utc)

        try:
            db.commit()
            db.refresh(existing_user)
        except Exception:
            db.rollback()
            raise

        return existing_user, otp

    otp = generate_otp()

    user = User(
        full_name=request.full_name.strip(),
        email=normalized_email,
        password_hash=hash_password(request.password),
        is_verified=False,
        otp_hash=hash_otp(otp),
        otp_expires_at=otp_expiry_time(),
        otp_attempts=0,
        otp_last_sent_at=datetime.now(timezone.utc),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    return user, otp


def resend_verification_otp(db: Session, email: str) -> tuple[User, str]:
    """Generate and return a new verification OTP for an existing unverified user."""
    normalized_email = str(email).strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None:
        raise ValueError("No account found with this email address.")

    if user.is_verified:
        raise ValueError("This account is already verified. Please log in.")

    now = datetime.now(timezone.utc)
    if user.otp_last_sent_at:
        last_sent = user.otp_last_sent_at
        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)
        if (now - last_sent).total_seconds() < 10:
            raise ValueError("Please wait a few seconds before requesting a new code.")

    otp = generate_otp()
    user.otp_hash = hash_otp(otp)
    user.otp_expires_at = otp_expiry_time()
    user.otp_attempts = 0
    user.otp_last_sent_at = now

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    return user, otp


def verify_user_otp(db: Session, email: str, otp: str) -> User:
    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None:
        raise ValueError("Invalid email or OTP.")

    if user.is_verified:
        raise ValueError("This account is already verified.")

    if not user.otp_hash or not user.otp_expires_at:
        raise ValueError("No active OTP. Please request a new code.")

    expires_at = user.otp_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= datetime.now(timezone.utc):
        raise ValueError("OTP has expired. Please request a new code.")

    if user.otp_attempts is not None and user.otp_attempts >= 5:
        raise ValueError("Too many attempts. Please request a new OTP.")

    if hash_otp(otp) != user.otp_hash:
        user.otp_attempts = (user.otp_attempts or 0) + 1
        db.commit()
        raise ValueError("Invalid email or OTP.")

    user.is_verified = True
    user.otp_hash = None
    user.otp_expires_at = None
    user.otp_attempts = 0

    db.commit()
    db.refresh(user)

    return user

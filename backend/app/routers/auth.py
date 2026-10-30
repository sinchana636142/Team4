from datetime import datetime, timedelta, timezone
import logging

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    UserProfileResponse,
    VerifyOTPRequest,
    ResendOTPRequest,
    PasswordResetRequest,
    VerifyPasswordResetOTPRequest,
    CompletePasswordResetRequest,
)
from app.services.auth_service import (
    register_user as create_registered_user,
    resend_verification_otp,
    verify_user_otp,
)
from app.services.email_service import send_otp_email
from app.services.otp_service import (
    generate_otp,
    hash_otp,
    otp_expiry_time,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserProfileResponse,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user, otp = create_registered_user(db, request)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    try:
        send_otp_email(user.email, otp)
    except Exception as exc:
        logger.exception("Could not deliver the verification code: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not deliver the verification code. Please try again.",
        ) from exc

    return user


@router.post(
    "/verify-otp",
    response_model=UserProfileResponse,
)
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    try:
        user = verify_user_otp(db, request.email, request.otp)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return user


@router.post("/resend-otp")
def resend_otp(
    request: ResendOTPRequest,
    db: Session = Depends(get_db),
):
    try:
        user, otp = resend_verification_otp(db, request.email)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    try:
        send_otp_email(user.email, otp)
    except Exception as exc:
        logger.exception("Could not deliver the verification code: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not deliver the verification code. Please try again.",
        ) from exc

    return {"message": "A new verification code has been sent to your email."}


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not verify_password(
        request.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserProfileResponse.model_validate(user),
    }


@router.post("/forgot-password")
def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    response = {
        "message": (
            "If a verified account exists for this email, "
            "a password-reset code has been generated."
        )
    }

    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.is_verified:
        return response

    otp = generate_otp()
    user.reset_otp_hash = hash_otp(otp)
    user.reset_otp_expires_at = otp_expiry_time()
    user.reset_otp_attempts = 0
    user.reset_otp_verified_until = None

    db.commit()

    try:
        send_otp_email(user.email, otp)
    except Exception as exc:
        user.reset_otp_hash = None
        user.reset_otp_expires_at = None
        user.reset_otp_attempts = 0
        user.reset_otp_verified_until = None
        db.commit()

        logger.exception("Could not deliver password-reset code")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not deliver the reset code. Please try again.",
        ) from exc

    return response


@router.post("/verify-reset-otp")
def verify_reset_otp(
    request: VerifyPasswordResetOTPRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    now = datetime.now(timezone.utc)

    if (
        not user.reset_otp_hash
        or not user.reset_otp_expires_at
        or user.reset_otp_expires_at <= now
        or (user.reset_otp_attempts or 0) >= 5
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Request a new one.",
        )

    if hash_otp(request.otp) != user.reset_otp_hash:
        user.reset_otp_attempts = (user.reset_otp_attempts or 0) + 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user.reset_otp_verified_until = now + timedelta(minutes=10)
    db.commit()

    return {
        "message": "Reset code verified. You may now reset your password."
    }


@router.post("/reset-password")
def reset_password(
    request: CompletePasswordResetRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Request a new one.",
        )

    now = datetime.now(timezone.utc)

    if (
        not user.reset_otp_hash
        or not user.reset_otp_expires_at
        or user.reset_otp_expires_at <= now
        or not user.reset_otp_verified_until
        or user.reset_otp_verified_until <= now
        or (user.reset_otp_attempts or 0) >= 5
        or hash_otp(request.otp) != user.reset_otp_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Verify a valid code again.",
        )

    user.password_hash = hash_password(request.new_password)

    user.reset_otp_hash = None
    user.reset_otp_expires_at = None
    user.reset_otp_attempts = 0
    user.reset_otp_verified_until = None

    db.commit()

    return {"message": "Password reset successfully."}


@router.get("/me", response_model=UserProfileResponse)
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    full_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    is_admin: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="viewer"
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Registration OTP fields
    otp_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    otp_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    otp_attempts: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    otp_last_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Password-reset OTP fields
    reset_otp_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    reset_otp_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    reset_otp_attempts: Mapped[int | None] = mapped_column(
        Integer, nullable=True, default=0
    )

    reset_otp_verified_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

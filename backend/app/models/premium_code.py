
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PremiumCodeRedemption(Base):
    __tablename__ = "premium_code_redemptions"

    # Each registered account can redeem the special code only once.
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
        nullable=False,
    )

    redeemed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

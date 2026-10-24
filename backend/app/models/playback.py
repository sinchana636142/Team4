from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_utc():
    return datetime.now(timezone.utc)


class PlaybackProgress(Base):
    """Last watched position for one user and one title (OTT-F-021)."""

    __tablename__ = "playback_progress"
    __table_args__ = (UniqueConstraint("user_id", "title_id", name="uq_progress_user_title"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title_id: Mapped[int] = mapped_column(ForeignKey("titles.id"), nullable=False)
    position_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc
    )

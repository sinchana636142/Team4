from pydantic import BaseModel, Field


class ResumeRequest(BaseModel):
    position_seconds: int = Field(ge=0)  # OTT-SR-005: reject bad input


class PlaybackResponse(BaseModel):
    title_id: int
    title: str
    video_url: str
    access_level: str = "basic"  # free, basic, premium, admin
    is_preview: bool = False
    preview_duration: int | None = None  # 120 seconds for Free preview
    quality: str = "1080p"
    actual_quality: str = "1080p"
    max_quality_supported: str = "1080p"
    trailer_url: str | None = None
    upgrade_required: bool = False
    message: str | None = None


class PlaybackAccessCheckResponse(BaseModel):
    title_id: int
    title: str
    can_watch_full: bool
    can_watch_preview: bool = True
    can_watch_trailer: bool = True
    membership: str  # free, basic, premium, admin
    max_quality: str  # 1080p, 4k
    is_4k_available: bool = False
    trailer_url: str | None = None
    preview_url: str | None = None

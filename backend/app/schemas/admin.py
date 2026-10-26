from datetime import date, datetime
from pydantic import BaseModel, Field, HttpUrl, field_validator


class TitleCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    genre: str | None = Field(default=None, max_length=100)
    year: int | None = Field(default=None, ge=1888, le=2100)
    synopsis: str | None = Field(default=None, max_length=5000)
    poster_url: str | None = Field(default=None, max_length=500)
    video_url: str | None = Field(default=None, max_length=500)
    is_published: bool = Field(default=True)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Title name cannot be blank or whitespace only.")
        return trimmed


class TitleUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    genre: str | None = Field(default=None, max_length=100)
    year: int | None = Field(default=None, ge=1888, le=2100)
    synopsis: str | None = Field(default=None, max_length=5000)
    poster_url: str | None = Field(default=None, max_length=500)
    video_url: str | None = Field(default=None, max_length=500)
    is_published: bool | None = None


class TitleAdminResponse(BaseModel):
    id: int
    title: str
    genre: str | None = None
    year: int | None = None
    synopsis: str | None = None
    poster_url: str | None = None
    video_url: str | None = None
    is_published: bool

    model_config = {"from_attributes": True}


class UserAdminItem(BaseModel):
    id: int
    full_name: str
    email: str
    is_verified: bool
    is_admin: bool
    role: str
    created_at: datetime | None = None
    subscription_status: str
    plan_name: str | None = None
    expiry_date: date | None = None


class PaginatedUsersResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[UserAdminItem]

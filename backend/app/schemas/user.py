
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_verified: bool
    avatar_url: str | None = None
    is_admin: bool = False
    role: str = "viewer"

    model_config = {"from_attributes": True}



class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


# Password-reset schemas

class PasswordResetRequest(BaseModel):
    email: EmailStr


class VerifyPasswordResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


class CompletePasswordResetRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)

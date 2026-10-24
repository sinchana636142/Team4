from pydantic import BaseModel, Field


class ResumeRequest(BaseModel):
    position_seconds: int = Field(ge=0)  # OTT-SR-005: reject bad input

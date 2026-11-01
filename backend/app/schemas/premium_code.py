
from pydantic import BaseModel, Field


class PremiumCodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100)

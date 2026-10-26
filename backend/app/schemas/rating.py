from pydantic import BaseModel, Field, ConfigDict


class RatingCreate(BaseModel):
    title_id: int = Field(gt=0)
    rating: int = Field(ge=1, le=5)


class RatingResponse(BaseModel):
    id: int
    user_id: int
    title_id: int
    rating: int

    model_config = ConfigDict(from_attributes=True)
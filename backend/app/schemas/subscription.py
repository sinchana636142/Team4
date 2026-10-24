from datetime import date

from pydantic import BaseModel


class SubscriptionStatusResponse(BaseModel):
    active: bool
    status: str  # none / pending / active / expired / cancelled
    plan_name: str | None = None
    price: int | None = None
    expiry_date: date | None = None

from datetime import date, datetime
from pydantic import BaseModel


class SubscriptionStatusResponse(BaseModel):
    active: bool
    status: str  # none / pending / active / expired / cancelled
    membership: str = "free"  # free / basic / premium
    plan_name: str | None = None
    price: int | None = None
    expiry_date: date | None = None
    max_quality: str = "1080p"
    device_limit: int = 1
    is_admin: bool = False

    model_config = {"from_attributes": True}


class PlanResponse(BaseModel):
    id: int
    name: str
    price: int
    period: str = "month"
    max_quality: str = "1080p"
    device_limit: int = 1
    features: list[str] = []
    description: str | None = None

    model_config = {"from_attributes": True}


class CheckoutOrderRequest(BaseModel):
    plan_id: int


class CheckoutOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
    plan_name: str
    plan_id: int


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    subscription: SubscriptionStatusResponse


class PaymentHistoryItem(BaseModel):
    id: int
    plan_id: int
    plan_name: str | None = None
    razorpay_order_id: str
    razorpay_payment_id: str | None = None
    amount: int  # in paise
    currency: str
    status: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}

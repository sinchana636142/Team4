from datetime import date

from pydantic import BaseModel


class SubscriptionStatusResponse(BaseModel):
    active: bool
    status: str  # none / pending / active / expired / cancelled
    plan_name: str | None = None
    price: int | None = None
    expiry_date: date | None = None

    model_config = {"from_attributes": True}


class PlanResponse(BaseModel):
    id: int
    name: str
    price: int

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


import { apiFetch } from "../api";

// returns { active, status, plan_name, price, expiry_date }
export function getSubscriptionStatus() {
  return apiFetch("/subscription/status");
}

// returns array of { id, name, price }
export function getSubscriptionPlans() {
  return apiFetch("/subscription/plans");
}

// creates a Razorpay checkout order
export function createCheckoutOrder(planId) {
  return apiFetch("/subscription/checkout", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  });
}

// verifies payment signature on backend and activates subscription
export function verifyPayment({ orderId, paymentId, signature }) {
  return apiFetch("/subscription/verify", {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    }),
  });
}

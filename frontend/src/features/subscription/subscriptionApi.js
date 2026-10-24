import { apiFetch } from "../api";

// returns { active, status, plan_name, price, expiry_date }
export function getSubscriptionStatus() {
  return apiFetch("/subscription/status");
}

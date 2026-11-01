
import { apiFetch } from "../api";

export function redeemPremiumCode(code) {
  return apiFetch("/premium-code/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

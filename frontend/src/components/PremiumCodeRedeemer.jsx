
import React, { useState } from "react";
import { redeemPremiumCode } from "../features/subscription/premiumCodeApi";
import "./PremiumCodeRedeemer.css";

export default function PremiumCodeRedeemer() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRedeem(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!code.trim()) {
      setError("Please enter your access code.");
      return;
    }

    setLoading(true);

    try {
      const result = await redeemPremiumCode(code.trim());
      setMessage(
        result.message || "Premium activated successfully for 30 days."
      );
      setCode("");
    } catch (err) {
      setError(err.message || "Unable to redeem the code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="premium-redeemer">
      <p className="premium-redeemer-label">SPECIAL OFFER</p>

      <h2>Have a Premium Access Code?</h2>

      <p className="premium-redeemer-description">
        Enter your special code to unlock 30 days of Premium access.
        Each registered account can redeem it only once.
      </p>

      <form onSubmit={handleRedeem}>
        <label htmlFor="premium-code-input">Access code</label>

        <div className="premium-redeemer-controls">
          <input
            id="premium-code-input"
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter your special code"
            autoComplete="off"
            maxLength={100}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Redeeming..." : "Redeem Premium"}
          </button>
        </div>
      </form>

      {message && (
        <p className="premium-redeemer-success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="premium-redeemer-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

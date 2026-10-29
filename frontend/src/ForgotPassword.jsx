
import { useState } from "react";
import "./ForgotPassword.css";

const API_URL = "http://127.0.0.1:8001";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to request a password reset."
        );
      }

      setStep(2);
      setMessage(
        data.message ||
        "If the account exists, a reset code has been generated. For local testing, check the backend terminal."
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that it is running on port 8001."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setCodeVerified(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not verify the reset code."
        );
      }

      setCodeVerified(true);
      setMessage(
        data.message || "Reset code verified. You may now reset your password."
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that it is running on port 8001."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!codeVerified) {
      setError("Verify your reset code before changing your password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: verificationCode,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not reset your password."
        );
      }

      setMessage(data.message || "Password reset successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setCodeVerified(false);
      setStep(3);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that it is running on port 8001."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reset-page">
      <section className="reset-card">
        <a className="reset-brand" href="/">
          <span>▶</span> StreamHub
        </a>

        <div className="reset-icon">🔐</div>

        <h1>
          {step === 1
            ? "Forgot your password?"
            : step === 2
              ? "Verify your account"
              : "Password reset complete"}
        </h1>

        <p className="reset-description">
          {step === 1
            ? "Enter your registered email address to begin the password-reset process."
            : step === 2
              ? `Enter the verification code for ${email}.`
              : "Your password has been changed successfully. You can now return to StreamHub and sign in with your new password."}
        </p>

        {message && (
          <div className="reset-message" role="status" aria-live="polite">
            {message}
          </div>
        )}

        {error && (
          <div className="reset-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={requestReset}>
            <label htmlFor="reset-email">Email address</label>
            <input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <button
              type="submit"
              className="reset-button"
              disabled={loading}
            >
              {loading ? "Requesting..." : "Request password reset"}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            <form onSubmit={verifyCode}>
              <label htmlFor="verification-code">Verification code</label>
              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="Enter your six-digit code"
                value={verificationCode}
                onChange={(event) => {
                  setVerificationCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  );
                  setCodeVerified(false);
                }}
                autoComplete="one-time-code"
                required
              />

              <button
                type="submit"
                className="reset-button"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify code"}
              </button>
            </form>

            <form className="password-form" onSubmit={resetPassword}>
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />

              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                className="reset-button"
                disabled={loading || !codeVerified}
              >
                {loading
                  ? "Resetting password..."
                  : "Reset password"}
              </button>

              {!codeVerified && (
                <p className="reset-description">
                  Verify the code above before resetting your password.
                </p>
              )}
            </form>

            <button
              type="button"
              className="reset-button"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setVerificationCode("");
                setNewPassword("");
                setConfirmPassword("");
                setCodeVerified(false);
                setMessage("");
                setError("");
              }}
            >
              Back to email entry
            </button>
          </>
        )}

        {step === 3 && (
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              window.location.href = "/#home";
            }}
          >
            Return to StreamHub
          </button>
        )}

        <a className="back-to-home" href="/#home">
          ← Back to StreamHub
        </a>
      </section>
    </main>
  );
}

export default ForgotPassword;

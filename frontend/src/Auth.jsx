import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:8000";

export default function Auth({ onVerified, onBack }) {
    const [step, setStep] = useState("register");
    const [fullName, setFullName] = useState("");
    const [emailUsername, setEmailUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // The backend continues to receive a complete email address.
    const email = `${emailUsername.trim()}@gmail.com`;

    async function handleRegister(event) {
        event.preventDefault();
        setMessage("");

        if (!emailUsername.trim()) {
            setMessage("Please enter your Gmail username.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Registration failed. Please check your details."
                );
            }

            setStep("verify");
            setMessage(
                "Verification code sent! Enter the six-digit OTP to complete registration."
            );
        } catch (error) {
            console.error("Registration error:", error);

            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot reach the backend on port 8000. Check that the server is running and CORS is configured."
                    : error.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(event) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Verification failed. Please check your OTP."
                );
            }

            if (data.is_verified !== true) {
                throw new Error(
                    "The server did not confirm email verification."
                );
            }

            setMessage("Email verified successfully! You can now log in.");

            if (typeof onVerified === "function") {
                onVerified();
            }
        } catch (error) {
            console.error("OTP verification error:", error);

            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot reach the backend on port 8000. Check the server and CORS settings."
                    : error.message || "OTP verification failed."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        if (!emailUsername.trim()) {
            setMessage("Please enter your Gmail username.");
            return;
        }

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to resend verification code."
                );
            }

            setMessage(
                data.message || "A new verification code has been sent to your email."
            );
        } catch (error) {
            console.error("Resend OTP error:", error);

            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot reach the backend on port 8000. Check the server and CORS settings."
                    : error.message
            );
        } finally {
            setLoading(false);
        }
    }

    function returnToRegistration() {
        setStep("register");
        setOtp("");
        setMessage("");
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>StreamHub</h1>

                {step === "register" ? (
                    <>
                        <h2>Create your account</h2>

                        <p>
                            Join StreamHub to explore your next favorite movie.
                        </p>

                        <form onSubmit={handleRegister}>
                            <label htmlFor="fullName">Full name</label>

                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(event.target.value)
                                }
                                minLength={2}
                                maxLength={100}
                                autoComplete="name"
                                required
                            />

                            <label htmlFor="emailUsername">Gmail address</label>

                            <div className="gmail-input-group">
                                <input
                                    id="emailUsername"
                                    type="text"
                                    value={emailUsername}
                                    onChange={(event) =>
                                        setEmailUsername(
                                            event.target.value
                                                .replace(/\s/g, "")
                                                .replace(/@.*$/, "")
                                        )
                                    }
                                    placeholder="Enter Gmail username"
                                    autoComplete="username"
                                    required
                                />
                                <span className="gmail-suffix">@gmail.com</span>
                            </div>

                            <label htmlFor="password">Password</label>

                            <div className="password-input-group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    minLength={8}
                                    maxLength={128}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>Verify your email</h2>

                        <p>
                            Enter the six-digit verification code for{" "}
                            <strong>{email}</strong>.
                        </p>

                        <form onSubmit={handleVerify}>
                            <label htmlFor="otp">
                                Verification code
                            </label>

                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={otp}
                                onChange={(event) =>
                                    setOtp(
                                        event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    )
                                }
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? "Verifying..." : "Verify email"}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="auth-secondary"
                            onClick={handleResendOtp}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Resend verification code"}
                        </button>

                        <button
                            type="button"
                            className="auth-secondary"
                            onClick={returnToRegistration}
                            disabled={loading}
                        >
                            Back to registration
                        </button>
                    </>
                )}

                {message && (
                    <p
                        className="auth-message"
                        role="status"
                        aria-live="polite"
                    >
                        {message}
                    </p>
                )}

                <button
                    type="button"
                    className="auth-secondary"
                    onClick={onBack}
                    disabled={loading}
                >
                    Back to homepage
                </button>
            </section>
        </main>
    );
}
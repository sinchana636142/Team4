import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:8001";

export default function Auth({ onVerified, onBack }) {
    const [step, setStep] = useState("register");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(event) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const detail = data.detail;

                throw new Error(
                    typeof detail === "string"
                        ? detail
                        : "Registration failed. Please check your details."
                );
            }

            setStep("verify");
            setMessage(
                "Verification code sent! Enter the six-digit OTP to complete registration."
            );
        } catch (error) {
            console.error("Registration error:", error);

            if (error.message === "Failed to fetch") {
                setMessage(
                    "Cannot reach the backend on port 8001. Check that the server is running and CORS is configured."
                );
            } else {
                setMessage(error.message || "Registration failed.");
            }
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
                    email: email.trim(),
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const detail = data.detail;

                throw new Error(
                    typeof detail === "string"
                        ? detail
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

            if (error.message === "Failed to fetch") {
                setMessage(
                    "Cannot reach the backend on port 8001. Check the server and CORS settings."
                );
            } else {
                setMessage(error.message || "OTP verification failed.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        if (!email.trim()) {
            setMessage("Please enter your email address to resend code.");
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
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to resend verification code.");
            }

            setMessage(data.message || "A new verification code has been sent to your email.");
        } catch (error) {
            console.error("Resend OTP error:", error);
            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot reach the backend on port 8001. Check the server and CORS settings."
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

                            <label htmlFor="email">Email address</label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                required
                            />

                            <label htmlFor="password">Password</label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />

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

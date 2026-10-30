import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:8000";

export default function Login({ onBack, onLoggedIn, onForgotPassword }) {
    const [emailUsername, setEmailUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);

    // Automatically append Gmail domain.
    const email = `${emailUsername.trim()}@gmail.com`;

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");
        setNeedsVerification(false);

        if (!emailUsername.trim()) {
            setMessage("Please enter your Gmail username.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Login failed. Please try again."
                );
            }

            if (!data.access_token) {
                throw new Error(
                    "Login succeeded, but no access token was returned."
                );
            }

            // Store login information for this browser session.
            sessionStorage.setItem(
                "streamhub_access_token",
                data.access_token
            );

            sessionStorage.setItem(
                "streamhub_user",
                JSON.stringify(data.user)
            );

            setMessage("Login successful!");

            if (typeof onLoggedIn === "function") {
                onLoggedIn(data.user);
            }
        } catch (error) {
            const msg =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check that it is running on port 8000."
                    : error.message;

            setMessage(msg);

            if (msg.toLowerCase().includes("verify your email")) {
                setNeedsVerification(true);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleResendVerification() {
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
                data.message ||
                "A new verification code has been sent to your email."
            );
        } catch (error) {
            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check that it is running on port 8000."
                    : error.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>StreamHub</h1>

                <h2>Welcome back</h2>

                <p>
                    Sign in to continue exploring your favorite movies.
                </p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="login-email">
                        Gmail address
                    </label>

                    <div className="gmail-input-group">
                        <input
                            id="login-email"
                            type="text"
                            placeholder="Enter Gmail username"
                            value={emailUsername}
                            onChange={(event) =>
                                setEmailUsername(
                                    event.target.value
                                        .replace(/\s/g, "")
                                        .replace(/@.*$/, "")
                                )
                            }
                            autoComplete="username"
                            required
                        />

                        <span className="gmail-suffix">
                            @gmail.com
                        </span>
                    </div>

                    <label htmlFor="login-password">
                        Password
                    </label>

                    <div className="password-input-group">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
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
                        {loading ? "Signing in..." : "Log in"}
                    </button>
                </form>

                {needsVerification && (
                    <button
                        type="button"
                        className="auth-secondary"
                        onClick={handleResendVerification}
                        disabled={loading}
                    >
                        {loading
                            ? "Sending..."
                            : "Resend verification code"}
                    </button>
                )}

                <button
                    type="button"
                    className="auth-secondary"
                    onClick={onForgotPassword}
                    disabled={loading}
                >
                    Forgot password?
                </button>

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

import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:8001";

export default function Login({ onBack, onLoggedIn, onForgotPassword }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
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
                throw new Error("Login succeeded, but no access token was returned.");
            }

            // Keep the token for this browser session.
            sessionStorage.setItem("streamhub_access_token", data.access_token);
            sessionStorage.setItem(
                "streamhub_user",
                JSON.stringify(data.user)
            );

            setMessage("Login successful!");

            if (onLoggedIn) {
                onLoggedIn(data.user);
            }
        } catch (error) {
            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check that it is running on port 8001."
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
                <p>Sign in to continue exploring your favorite movies.</p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="login-email">Email address</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Log in"}
                    </button>
                </form>

                <button
                    type="button"
                    className="auth-secondary"
                    onClick={onForgotPassword}
                    disabled={loading}
                >
                    Forgot password?
                </button>

                {message && (
                    <p className="auth-message" role="status" aria-live="polite">
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

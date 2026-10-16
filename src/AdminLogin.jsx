import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

// Use the backend URL configured in your Vite environment variables.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_URL = `${API_BASE_URL}/api/admin/login`;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (!API_BASE_URL) {
      setError(
        "Backend URL is missing. Please configure VITE_API_URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Invalid password."
        );
      }

      const token =
        data.token || data.accessToken || data.access_token;

      if (!token) {
        throw new Error(
          "Authentication token missing from server response."
        );
      }

      localStorage.setItem("adminToken", token);

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            S<span>+</span>
          </div>

          <div>
            <h2>
              SmartCRM <span>AI</span>
            </h2>
            <p>INTELLIGENCE. AUTOMATION. GROWTH.</p>
          </div>
        </div>

        <div className="login-heading">
          <span className="login-label">
            <span className="login-label-dot" />
            ADMIN WORKSPACE
          </span>

          <h1>
            Welcome back<span>.</span>
          </h1>

          <p>
            Sign in to manage your leads and access your
            intelligent workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password">
            Admin password
          </label>

          <div className="login-input-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />

            <button
              type="button"
              className="login-show-password"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            <span>
              {loading ? "Signing in..." : "Access dashboard"}
            </span>

            {!loading && (
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>SECURE ADMIN ACCESS</p>
          <span />
        </div>

        <div className="login-security">
          <div className="login-security-icon">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div>
            <strong>Your workspace is protected</strong>
            <p>Authorized administrators only</p>
          </div>

          <span className="login-status-dot" />
        </div>
      </section>

      <footer className="login-footer">
        <span>© 2026 SmartCRM AI</span>
        <span>BUILT FOR BETTER RELATIONSHIPS</span>
      </footer>
    </main>
  );
}
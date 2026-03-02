import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(""); // "USER" or "TRAINER"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      if (data.role === "TRAINER") {
        navigate("/trainer-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    setForgotError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send OTP");
      }

      setForgotMsg("✅ OTP sent to your email!");
      setForgotStep("otp");
    } catch (error) {
      setForgotError(error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    setForgotError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setForgotMsg("✅ Password reset successfully! Redirecting...");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep("email");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        navigate("/login");
      }, 1500);
    } catch (error) {
      setForgotError(error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Google OAuth — standard popup flow (bypasses FedCM / COOP issues)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Get user info from Google using the access token
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        // 2. Send the Google user info + selected role to our backend
        const res = await fetch("http://localhost:8080/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name, role: selectedRole }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Google login failed");
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data));
        if (data.role === "TRAINER") {
          navigate("/trainer-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } catch (error) {
        setErrors({ form: error.message });
      }
    },
    onError: () => {
      setErrors({ form: "Google login failed. Please try again." });
    },
  });

  const handleGoogleClick = () => {
    if (!selectedRole) {
      setErrors({ googleRole: "Please select a role (User or Trainer) before continuing with Google." });
      return;
    }
    setErrors({});
    googleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">WELCOME BACK</h2>
          <p className="auth-subtitle">Login to your account and continue</p>
        </div>

        {errors.form && <p className="error-message">{errors.form}</p>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="auth-actions">
            <button
              type="button"
              className="auth-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="divider">OR</div>

        {/* ── Role selector ── */}
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-gray)", textAlign: "center", marginBottom: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Select your role to continue with Google
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {["USER", "TRAINER"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setSelectedRole(r); setErrors((e) => ({ ...e, googleRole: "" })); }}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  borderRadius: "8px",
                  border: selectedRole === r
                    ? "2px solid var(--primary)"
                    : "1px solid rgba(148,163,184,0.25)",
                  background: selectedRole === r
                    ? "rgba(251,242,79,0.12)"
                    : "rgba(15,23,42,0.6)",
                  color: selectedRole === r ? "var(--primary)" : "var(--text-gray)",
                  fontWeight: selectedRole === r ? 700 : 500,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "var(--transition)",
                  letterSpacing: "0.05em",
                }}
              >
                {r === "USER" ? "👤 User" : "🏋️ Trainer"}
              </button>
            ))}
          </div>
          {errors.googleRole && (
            <p style={{ fontSize: "0.8rem", color: "var(--error)", marginTop: "0.4rem", textAlign: "center" }}>
              {errors.googleRole}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="google-button"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
          Continue with Google
        </button>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </div>

      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div
            className="auth-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "380px" }}
          >
            <button
              type="button"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "var(--text-white)",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
              onClick={() => setShowForgotModal(false)}
            >
              ×
            </button>

            <h3 className="auth-title" style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
              Reset Password
            </h3>

            {forgotError && <p className="error-message">{forgotError}</p>}
            {forgotMsg && <p className="success-message">{forgotMsg}</p>}

            {forgotStep === "email" && (
              <form className="auth-form" onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="auth-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "SENDING..." : "SEND OTP"}
                </button>
              </form>
            )}

            {forgotStep === "otp" && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>OTP (6 Digits)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="auth-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "RESETTING..." : "RESET PASSWORD"}
                </button>
                <button
                  type="button"
                  className="auth-link"
                  style={{
                    marginTop: "1rem",
                    display: "block",
                    textAlign: "center",
                    width: "100%",
                  }}
                  onClick={() => {
                    setForgotStep("email");
                    setOtp("");
                    setNewPassword("");
                  }}
                >
                  ← Back to Email
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
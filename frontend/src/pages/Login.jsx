import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
      localStorage.setItem("user", JSON.stringify(data));
      
      // REDIRECT TO DASHBOARD AFTER SUCCESSFUL LOGIN
      navigate("/dashboard");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Send OTP
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

  // Forgot Password - Reset Password with OTP
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

  // FIXED: Google OAuth handler - navigate to dashboard instead of alert
  const handleGoogleLogin = () => {
    // TODO: Integrate real Google OAuth here using @react-oauth/google
    // For now, redirect to dashboard
    console.log("Google OAuth will be integrated here");
    // Uncomment after setting up Google OAuth:
    // navigate("/dashboard");
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
            abel>EMAIL ADDRESS</label>
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
            abel>PASSWORD</label>
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

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="18"
          />
          Continue with Google
        </button>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px" }}>
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
                  abel>Email Address</label>
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
                  abel>OTP (6 Digits)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  abel>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
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

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email"); // "email" or "otp"
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

      setForgotMsg("✅ OTP sent to your email. Check your inbox!");
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
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setForgotMsg("✅ Password reset successfully! You can now login.");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep("email");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setForgotMsg("");
      }, 1500);
    } catch (error) {
      setForgotError(error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    try {
      // Send Google token to backend
      const res = await fetch("http://localhost:8080/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Google login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Login to access your dashboard.</p>

        {errors.form && <div className="error-message">{errors.form}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setShowForgotModal(true);
            setForgotStep("email");
            setForgotEmail("");
            setOtp("");
            setNewPassword("");
            setForgotMsg("");
            setForgotError("");
          }}
        >
          Forgot Password?
        </button>

        {/* Google Login Button */}
        <button type="button" className="btn-google" onClick={() => {
          // For now, show a demo message
          // In production, integrate Google OAuth library
          alert("Google login will be integrated with Google OAuth library");
        }}>
          <span>🔵</span> Continue with Google
        </button>

        <p className="signup-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowForgotModal(false)}
            >
              ✕
            </button>

            <h3>Reset Your Password</h3>

            {forgotError && <div className="error-message">{forgotError}</div>}
            {forgotMsg && <div className="success-message">{forgotMsg}</div>}

            {forgotStep === "email" && (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {forgotStep === "otp" && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>OTP (6 digits)</label>
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
                  <label>New Password</label>
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
                  className="btn-primary"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setForgotStep("email");
                    setOtp("");
                    setNewPassword("");
                    setForgotMsg("");
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

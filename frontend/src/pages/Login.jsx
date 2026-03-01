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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">
          Login to your account to continue your journey.
        </p>

        {errors.form && <p className="error-text">{errors.form}</p>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="auth-actions" style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
            <button
              type="button"
              className="auth-link"
              style={{ background: 'none', border: 'none' }}
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
          </div>

          <button className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="divider" style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', color: 'var(--text-gray)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--text-gray)', opacity: 0.2 }}></div>
            <span style={{ margin: '0 1rem', fontSize: '0.9rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--text-gray)', opacity: 0.2 }}></div>
          </div>

          <button
            type="button"
            className="google-button"
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onClick={() => alert("Google login will be integrated with Google OAuth library")}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Continue with Google
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="auth-card" style={{ maxWidth: '400px', width: '90%', position: 'relative' }}>
            <button
              type="button"
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-white)',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
              onClick={() => setShowForgotModal(false)}
            >
              ✕
            </button>
            <h3 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reset Password</h3>
            {forgotError && <p className="error-text">{forgotError}</p>}
            {forgotMsg && <p style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem' }}>{forgotMsg}</p>}
            
            {forgotStep === "email" && (
              <form className="auth-form" onSubmit={handleSendOtp}>
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
                  className="auth-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {forgotStep === "otp" && (
              <form className="auth-form" onSubmit={handleResetPassword}>
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
                  className="auth-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  className="auth-link"
                  style={{ marginTop: '1rem', display: 'block', textAlign: 'center', width: '100%', background: 'none', border: 'none' }}
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

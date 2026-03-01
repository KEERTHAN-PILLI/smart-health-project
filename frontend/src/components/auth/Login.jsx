import React, { useState } from "react";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [loginError, setLoginError] = useState("");

  const backendUrl = "http://localhost:8080/api/auth";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch(backendUrl + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(backendUrl + "/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setMsg("OTP sent to your email.");
      setStep("otp");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(backendUrl + "/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          newPassword,
        }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      setMsg("Password reset successful. Please login with new password.");
      setTimeout(() => {
        setShowForgot(false);
        setStep("email");
        setOtp("");
        setNewPassword("");
        setEmail(forgotEmail);
      }, 1500);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // For Google OAuth, use your frontend OAuth library
    // Example: window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?...`
    console.log("Google login clicked");
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login</h2>

        {loginError && <div className="error-text">{loginError}</div>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setShowForgot(true);
            setForgotEmail(email || "");
            setStep("email");
            setMsg("");
          }}
        >
          Forgot password?
        </button>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>
      </form>

      {showForgot && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Reset Password</h3>

            {step === "email" && (
              <form onSubmit={handleSendOtp}>
                <label>Registered Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleResetPassword}>
                <label>OTP (6 digits)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  required
                />
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            )}

            {msg && <p className="info-text">{msg}</p>}

            <button
              className="link-btn"
              onClick={() => {
                setShowForgot(false);
                setStep("email");
                setMsg("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

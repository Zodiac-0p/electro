// src/pages/auth/Login.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import {
  loginUser,
  addToCart as addToCartAPI,
  googleLogin,
  phoneLoginSendOtp,
  phoneLoginVerifyOtp,
} from "../../services/api";

import { Mail, Lock, Eye, EyeOff, Phone, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { auth } from "../../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  // password login
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // phone otp modal states
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const signupSuccess = sessionStorage.getItem("signupSuccess");
    if (signupSuccess === "true") {
      setSuccessMessage("Account created successfully. Please login.");
      sessionStorage.removeItem("signupSuccess");
    }
  }, []);

  // ✅ Save auth in ONE place (Header depends on these keys)
  const saveAuth = (data) => {
    const access = data?.access || data?.accessToken || data?.token;
    const refresh = data?.refresh || data?.refreshToken;

    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  // ✅ EMAIL/USERNAME + PASSWORD LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(identifier, password);
      if (data) saveAuth(data);

      // ✅ Sync local cart with backend cart
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (localCart.length > 0) {
        for (const item of localCart) {
          try {
            await addToCartAPI(item.id, item.quantity || 1);
          } catch (err) {
            console.error("Error syncing item:", item, err);
          }
        }
        localStorage.removeItem("cart");
      }

      localStorage.setItem("loginSuccessMsg", "Login successful. Welcome back!");
      navigate("/");
      window.location.reload();
    } catch (err) {
      let msg = "Login failed. Please check your username/email and password.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail) msg = parsed.detail;
        else if (parsed.message) msg = parsed.message;
      } catch {
        if (err?.message) msg = err.message;
      }
      setError(msg);
    }
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const data = await googleLogin(idToken);
      saveAuth(data);

      localStorage.setItem("loginSuccessMsg", "Google login successful!");
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Google login error:", err);
      setError(err?.message || "Google login failed");
    }
  };

  // -------- PHONE MODAL HELPERS --------
  const openPhoneModal = () => {
    setIsPhoneModalOpen(true);
    setError("");
    setStatus("");
    setSuccessMessage("");
    setPhone("");
    setOtp("");
    setOtpSent(false);
  };

  const closePhoneModal = () => {
    if (loading) return; // avoid closing mid-request
    setIsPhoneModalOpen(false);
  };

  // ✅ PHONE OTP: SEND
  // ✅ PHONE OTP: SEND
const handleSendOtp = async () => {
  setError("");
  setStatus("");

  const p = phone.trim();
  if (!p || p.length < 10) {
    setError("Enter a valid phone number");
    return;
  }

  try {
    console.log("✅ Send OTP clicked. phone =", p);

    setLoading(true);

    const resp = await phoneLoginSendOtp(p);
    console.log("✅ Send OTP response =", resp);

    setOtpSent(true);
    setStatus("✅ OTP sent to your phone");
  } catch (err) {
    console.log("❌ Send OTP error object =", err);
    console.log("❌ err.message =", err?.message);

    try {
      const parsed = JSON.parse(err.message);
      console.log("❌ parsed backend error =", parsed);
      setError(parsed.detail || parsed.error || "This number is not registered.");
    } catch {
      setError(err?.message || "This number is not registered .");
    }
  } finally {
    setLoading(false);
  }
};

// ✅ PHONE OTP: VERIFY + LOGIN
const handleVerifyOtp = async () => {
  setError("");
  setStatus("");

  const p = phone.trim();
  const code = otp.trim();

  if (!code || code.length !== 4) {
    setError("Enter a valid 4-digit OTP");
    return;
  }

  try {
    // console.log("✅ Verify OTP clicked", { p, code });

    setLoading(true);

    const data = await phoneLoginVerifyOtp(p, code);
    console.log("✅ Verify response =", data);

    saveAuth(data);

    localStorage.setItem("loginSuccessMsg", "Phone login successful!");
    closePhoneModal();
    navigate("/");
    window.location.reload();
  } catch (err) {
    console.log("❌ Verify error =", err);

    let msg = "Invalid or expired OTP.";
    try {
      const parsed = JSON.parse(err.message);
      msg = parsed.detail || parsed.error || msg;
    } catch {
      msg = err?.message || msg;
    }
    setError(msg);
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        {successMessage && (
          <div className="login-success-msg">{successMessage}</div>
        )}
        {error && <div className="login-error-msg">{error}</div>}

        {/* ✅ GOOGLE LOGIN */}
        <button type="button" className="social-btn google-btn" onClick={handleGoogleLogin}>
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </button>

        {/* ✅ PHONE LOGIN ICON BUTTON */}
        <button type="button" className="social-btn phone-btn" onClick={openPhoneModal}>
          <Phone size={18} />
          <span>Continue with Phone</span>
        </button>

        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* ✅ NORMAL LOGIN */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/account/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>

      {/* ✅ PHONE LOGIN POPUP / MODAL */}
      {isPhoneModalOpen && (
        <div className="modal-overlay" onClick={closePhoneModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Login with Phone</h3>
              <button className="modal-close" onClick={closePhoneModal} disabled={loading}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-subtext">We will send an OTP to your phone number.</p>

            <div className="form-group">
              <label>Phone</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setOtp("");
                    setOtpSent(false);
                    setStatus("");
                    setError("");
                  }}
                  placeholder="Enter phone number"
                  disabled={otpSent || loading}
                />

                {!otpSent ? (
                  <button type="button" className="otp-action-btn" onClick={handleSendOtp} disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="otp-action-btn"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setStatus("");
                      setError("");
                    }}
                    disabled={loading}
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label>Enter OTP</label>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="6-digit OTP"
                    disabled={loading}
                  />

                  <button type="button" className="otp-action-btn" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? "Verifying..." : "Submit"}
                  </button>

                  <button type="button" className="otp-link-btn" onClick={handleSendOtp} disabled={loading}>
                    Resend
                  </button>
                </div>
              </div>
            )}

            {status && <p className="modal-status ok">{status}</p>}
            {error && <p className="modal-status err">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
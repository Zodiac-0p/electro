import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword } from "../../services/api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp+reset, 3=success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer > 0) {
      const i = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(i);
    }
  }, [timer]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    setError("");
    setMsg("");

    try {
      await forgotPassword(email);
      setStep(2);
      setTimer(60);
      setMsg("OTP sent to your email.");
    } catch {
      setError("Email not found.");
    }
  };

  /* ================= VERIFY & RESET ================= */
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(email, otp, password);
      setStep(3);
      setMsg("Password reset successful. You can login now.");
    } catch {
      setError("Invalid or expired OTP.");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
            <div className="fp-group">
              <label>Email Address</label>
              <div className="fp-input-wrapper">
                <Mail size={18} className="fp-icon" />
                <input
                  type="email"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="fp-btn">Send OTP</button>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div className="fp-group">
              <label>OTP</label>
              <div className="fp-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="fp-group">
              <label>New Password</label>
              <div className="fp-input-wrapper">
                <Lock size={18} className="fp-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="fp-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="fp-group">
              <label>Confirm Password</label>
              <div className="fp-input-wrapper">
                <Lock size={18} className="fp-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="fp-btn">Verify & Reset</button>

            <div className="fp-resend">
              {timer > 0 ? (
                <span className="fp-timer">
                  Resend OTP in {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  className="fp-resend-btn"
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && <div className="fp-success">{msg}</div>}

        {/* ================= ERRORS ================= */}
        {error && <div className="fp-error">{error}</div>}
        {msg && step !== 3 && <div className="fp-success">{msg}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

const ForgotPasswordOTP = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer === 0) return;
    const i = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        email: form.email,
        otp: form.otp,
        password: form.password,
      });
      navigate("/login");
    } catch {
      setError("Invalid or expired OTP");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit} autoComplete="off">

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            autoComplete="one-time-code"
            inputMode="numeric"
            required
          />

          {/* PASSWORD FIELD WITH EYE ICON */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              placeholder="Confirm New Password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" className="login-btn">
            Verify & Reset
          </button>
        </form>

        <p className="resend-text">
          {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;

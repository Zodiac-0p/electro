import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import { signupUser } from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const generateCaptcha = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    captcha: "",
  });

  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setGeneratedCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setGeneratedCaptcha(generateCaptcha());
    setFormData({ ...formData, captcha: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, password2, captcha } = formData;

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    if (captcha !== generatedCaptcha) {
      setError("Invalid captcha");
      refreshCaptcha();
      return;
    }

    try {
      setLoading(true);

      await signupUser({ username, email, password, password2 });

      // ✅ Save success flag for login page
      sessionStorage.setItem("signupSuccess", "true");

      // Redirect immediately
      navigate("/account/login");

    } catch (err) {
      console.error("Signup error:", err);

      let msg = "Signup failed. Please try again.";
      try {
        const parsed = JSON.parse(err.message);
        msg = Object.values(parsed).flat().join(" ");
      } catch {}

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="form-group">
            <label>Captcha</label>
            <div className="captcha-box">
              <span className="captcha-value">{generatedCaptcha}</span>
              <button
                type="button"
                className="refresh-captcha"
                onClick={refreshCaptcha}
              >
                ↻
              </button>
            </div>
            <input
              type="text"
              name="captcha"
              value={formData.captcha}
              onChange={handleChange}
              placeholder="Enter captcha"
              required
            />
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/account/login" className="signup-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

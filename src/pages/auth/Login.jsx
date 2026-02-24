// src/pages/Login.jsx

import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser, addToCart as addToCartAPI } from "../../services/api"; // <-- ✅ FIX 1: Corrected the import name
import { Mail, Lock, Eye, EyeOff } from "lucide-react";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
  const signupSuccess = sessionStorage.getItem("signupSuccess");

  if (signupSuccess === "true") {
    setSuccessMessage("Account created successfully. Please login.");
    sessionStorage.removeItem("signupSuccess"); // show only once
  }
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Pass identifier (username or email) to loginUser
      const data = await loginUser(identifier, password);

      // 2️⃣ Save tokens and login info
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", data.username);

      // ✅ ADD THIS
      localStorage.setItem("loginMessage", "Login successful. Welcome back!");
      // 3️⃣ Sync localStorage cart with backend cart
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (localCart.length > 0) {
        console.log("Syncing local cart with backend...");
        for (const item of localCart) {
          try {
            // ✅ FIX 2: Corrected the function call and removed the token argument
            await addToCartAPI(item.id, item.quantity || 1);
          } catch (err) {
            console.error("Error syncing item:", item, err);
          }
        }
        localStorage.removeItem("cart");
        console.log("Cart synced successfully with backend!");
      }

      // 4️⃣ Redirect after login
      navigate("/");
      window.location.reload();
    } catch (err) {
      let msg = "Login failed. Please check your username/email and password.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail) msg = parsed.detail;
        else if (parsed.message) msg = parsed.message;
      } catch {
        // fallback to default
      }
      setError(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {successMessage && (
  <div className="login-success-msg">{successMessage}</div>
)}

        <form onSubmit={handleSubmit}>
          {/* Identifier (Username or Email) */}
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

            {/* Password */}
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


          {/* Forgot password */}
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {error && (
            <div className="login-error-msg">{error}</div>
          )}

          <button type="submit" className="login-btn">
            Logi n
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/account/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
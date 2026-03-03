import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../../services/api";
import "./LoginModal.css";
import { auth } from "../../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const LoginModal = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await loginUser(identifier, password);

      const access = localStorage.getItem("accessToken");
      if (!access) {
        console.log("LOGIN RESPONSE =", res);
        throw new Error("Token not received from server. Check login API response.");
      }

      localStorage.setItem("loginSuccessMsg", "Login successful!");
      onSuccess?.();
      onClose?.();
    } catch (e2) {
      let message = e2?.message || "Login failed";

      // if backend error is JSON string, parse it
      try {
        const parsed = JSON.parse(message);
        message =
          parsed?.detail ||
          parsed?.message ||
          parsed?.error ||
          (typeof parsed === "string" ? parsed : message);
      } catch {
        // keep plain text
      }

      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => {
    onClose?.();
    navigate("/account/signup"); // ✅ same route as Login page
  };

  const handleGoogleLogin = async () => {
  setErr("");
  setLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const data = await googleLogin(idToken);

    // ✅ Save tokens directly (since you don't have saveAuth)
    if (data?.access) localStorage.setItem("accessToken", data.access);
    if (data?.refresh) localStorage.setItem("refreshToken", data.refresh);
    if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

    localStorage.setItem("loginSuccessMsg", "Google login successful!");
    onSuccess?.();
    onClose?.();
    navigate("/");
    window.location.reload();
  } catch (e) {
    console.error("Google login error:", e);
    setErr(e?.message || "Google login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="lm-backdrop" onMouseDown={onClose}>
      <div className="lm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="lm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="lm-body">
          <div className="lm-left">
            <h2>Login</h2>
            <p>Get access to orders, wishlist and recommendations.</p>
          </div>

          <div className="lm-right">
            <form onSubmit={handleLogin}>
              <label>Email / Username / Phone</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email/username/phone"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {err && <div className="lm-error">{err}</div>}

              <button className="lm-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="lm-divider">
                <span>OR</span>
              </div>

              <div className="lm-google-wrapper">
                <button
                  type="button"
                  className="google-icon-btn"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                  />
                </button>
              </div>
              <div className="lm-hint">
                Don’t have an account?{" "}
                <span className="lm-link" onClick={goRegister}>
                  Create one
                </span>
              </div>
            </form>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoginModal;
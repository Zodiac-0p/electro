import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

// ✅ Define API_BASE here (Fixes: API_BASE is not defined)
const API_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Admin login endpoint
      const res = await axios.post(`${API_BASE}/admin/users/login/`, {
        identifier,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ User object can be nested or flat (supports both)
      const user = res.data.user ? res.data.user : res.data;

      // ✅ Admin check
      if (!(user.is_staff || user.is_superuser)) {
        setError("You are not an admin");
        return;
      }

      // ✅ Store tokens
      localStorage.setItem("admin_access", res.data.access);
      localStorage.setItem("admin_refresh", res.data.refresh);

      // ✅ Store user
      localStorage.setItem("admin_user", JSON.stringify(user));

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      // Better error message if backend sends detail
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Invalid credentials";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth">
      {/* Left side brand panel */}
      <div className="admin-auth__left">
        <div className="brand">
          <div className="brand__logo">A</div>
          <div>
            <h1 className="brand__title">Admin Panel</h1>
            <p className="brand__subtitle">
              Manage products, orders, users & reports securely.
            </p>
          </div>
        </div>

        <div className="brand__bullets">
          <div className="bullet">
            <span className="dot" />
            <p>Role-based access (Admin only)</p>
          </div>
          <div className="bullet">
            <span className="dot" />
            <p>Secure authentication</p>
          </div>
          <div className="bullet">
            <span className="dot" />
            <p>Fast management dashboard</p>
          </div>
        </div>

        <div className="brand__footer">
          <small>© {new Date().getFullYear()} Your Company</small>
        </div>
      </div>

      {/* Right side login card */}
      <div className="admin-auth__right">
        <div className="login-card">
          <div className="login-card__header">
            <h2>Sign in</h2>
            <p>Enter your admin credentials to continue</p>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={submit} className="login-form">
            <div className="field">
              <label>Username / Email</label>
              <input
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="login-card__hint">
              <small>Only staff accounts can access this panel.</small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
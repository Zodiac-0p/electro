import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

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
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        identifier,
        password,
      });

      if (!res.data.is_staff) {
        setError("You are not an admin");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_access", res.data.access);
      localStorage.setItem("admin_refresh", res.data.refresh);
      localStorage.setItem(
        "admin_user",
        JSON.stringify({
          username: res.data.username,
          is_staff: res.data.is_staff,
        })
      );

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials");
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
                  aria-label="Toggle password visibility"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="login-card__hint">
              <small>
                Only staff accounts can access this panel.
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

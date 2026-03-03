import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user");

    setShowLogoutConfirm(false);
    setShowLogoutMessage(true);

    setTimeout(() => {
      navigate("/admin/login");
    }, 2000);
  };

  return (
    <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin</h2>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((s) => !s)}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/products" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-label">Products</span>
          </NavLink>

          <NavLink to="/admin/categories" className="nav-item">
            <span className="nav-icon">🗂️</span>
            <span className="nav-label">Categories</span>
          </NavLink>

          <NavLink to="/admin/orders" className="nav-item">
            <span className="nav-icon">🧾</span>
            <span className="nav-label">Orders</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {/* ✅ open confirm popup (not direct logout) */}
          <button
            className="logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={showLogoutMessage}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h3>Admin Panel</h3>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* ✅ Logout Confirm Popup */}
      {showLogoutConfirm && (
        <div className="logout-popup">
          <div className="logout-popup-content">
            <h3>Are you sure?</h3>
            <p>Do you really want to logout?</p>

            <div className="logout-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button className="confirm-btn" onClick={doLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Logout Success Message */}
      {showLogoutMessage && (
        <div className="logout-popup">
          <div className="logout-popup-content">
            <div className="logout-icon">✓</div>
            <h3>Successfully Logged Out</h3>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
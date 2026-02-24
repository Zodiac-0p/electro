import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
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
          <button className="logout-btn" onClick={logout}>
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
    </div>
  );
};

export default AdminLayout;

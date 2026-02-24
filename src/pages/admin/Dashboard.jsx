import { useEffect, useState } from "react";
import adminApi from "../../services/adminApi";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersRes, productsRes] = await Promise.all([
          adminApi.get("users/orders/"),
          adminApi.get("catalog/products/"),
        ]);

        if (!alive) return;

        setStats({
          orders: ordersRes?.data?.count ?? 0,
          products: productsRes?.data?.count ?? 0,
        });
      } catch (e) {
        if (!alive) return;
        setError("Failed to load dashboard stats.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="admin-page">
      {/* Top header */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">Quick overview of your store</p>
        </div>

        <div className="admin-actions">
          <button
            className="btn btn-secondary"
            onClick={() => (window.location.href = "/admin/products")}
          >
            Manage Products
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/admin/orders")}
          >
            View Orders
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="admin-alert">{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <p className="stat-label">Total Orders</p>
            {loading ? <div className="skeleton skeleton-text" /> : <h2 className="stat-value">{stats.orders}</h2>}
          </div>
          <div className="stat-icon">📦</div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <p className="stat-label">Total Products</p>
            {loading ? <div className="skeleton skeleton-text" /> : <h2 className="stat-value">{stats.products}</h2>}
          </div>
          <div className="stat-icon">🧾</div>
        </div>
      </div>

      {/* Simple section below */}
      <div className="admin-section">
        <h3 className="section-title">Today</h3>
        <p className="section-desc">
          Keep this area for latest orders / low stock alerts later.
        </p>

        <div className="mini-grid">
          <div className="mini-card">
            <p className="mini-title">Quick Tip</p>
            <p className="mini-text">Add latest 5 orders table here.</p>
          </div>

          <div className="mini-card">
            <p className="mini-title">Next Step</p>
            <p className="mini-text">Add “Low stock” alerts here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

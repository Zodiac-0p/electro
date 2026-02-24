import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { Link } from "react-router-dom";
import "./MyOrders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch("/user/orders/", "GET", null, true);
      setOrders(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirm) return;

    try {
      setCancelLoading(orderId);

      await apiFetch(
        `/user/orders/${orderId}/cancel/`,
        "POST",
        null,
        true
      );

      // Update UI instantly
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "cancelled by user" }
            : order
        )
      );
    } catch (err) {
      alert("Failed to cancel order.");
    } finally {
      setCancelLoading(null);
    }
  };
  const deleteOrder = async (orderId) => {
  const confirm = window.confirm(
    "Remove this order from your order history?"
  );

  if (!confirm) return;

  try {
    await apiFetch(
      `/user/orders/${orderId}/delete/`,
      "DELETE",
      null,
      true
    );

    // Remove from UI
    setOrders((prev) =>
      prev.filter((order) => order.id !== orderId)
    );
  } catch (err) {
    alert("Failed to remove order.");
  }
};

  if (loading) return <div className="orders-loading">Loading orders...</div>;
  if (error) return <div className="orders-error">{error}</div>;
  if (!orders.length) return <div className="orders-empty">No orders found.</div>;

  return (
    <div className="orders-container">
      <h1 className="orders-title">My Orders</h1>

      <div className="orders-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const canCancel =
                order.status === "pending" ||
                order.status === "processing";

              return (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>

                  <td>₹{order.total_amount}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  <td className="order-actions">
                    <Link
                      className="details-link"
                      to={`/account/orders/${order.id}`}
                    >
                      View
                    </Link>

                    {/* Cancel button (only if allowed) */}
                    {(order.status === "pending" || order.status === "processing") && (
                      <button
                        className="cancel-btn"
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancelLoading === order.id}
                      >
                        {cancelLoading === order.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}

                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;

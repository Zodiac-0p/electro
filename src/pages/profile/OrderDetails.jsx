import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await apiFetch(`/user/orders/${id}/`, "GET", null, true);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p className="order-loading">Loading order details...</p>;
  if (error) return <p className="order-error">{error}</p>;
  if (!order) return <p className="order-error">Order not found.</p>;

  return (
    <div className="order-detail-container">
      <div className="order-header">
        <h1>Order #{order.id}</h1>
        <span className={`order-status ${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </div>

      <div className="order-meta">
        <p>
          <strong>Total:</strong> ₹{order.total_amount}
        </p>
        <p>
          <strong>Placed:</strong>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <h2 className="section-title">Products</h2>

      <div className="order-table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.product_id}>
                <td
                  className="order-product-link"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                >
                  {item.product_name}
                </td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{item.quantity * item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="/account/orders" className="back-link">
        ← Back to Orders
      </Link>
    </div>
  );
};

export default OrderDetail;

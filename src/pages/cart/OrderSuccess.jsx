import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./orderSuccess.css";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1) URL param first
    if (paramId) {
      setOrderId(paramId);
      return;
    }

    // 2) fallback localStorage
    const savedOrderId = localStorage.getItem("lastOrderId");
    if (savedOrderId) {
      setOrderId(savedOrderId);
      return;
    }

    // 3) no order id -> go home
    navigate("/");
  }, [paramId, navigate]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      setOrder(null);

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Please login to view order details.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/user/orders/${orderId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.detail || "Unable to fetch order details");
        }

        setOrder(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon">✓</div>

        <h1 className="white-text">Order Placed Successfully!</h1>
        <p className="white-text">Your order has been placed and is being processed.</p>

        {orderId && (
          <div className="order-details">
            <span>Order ID:</span>
            <strong>#{orderId}</strong>
          </div>
        )}

        {loading && <p className="white-text">Loading order details...</p>}
        {error && <p className="white-text" style={{ color: "#ffb3b3" }}>{error}</p>}

        {/* ✅ Show real user-entered details */}
        {order && (
          <div className="order-summary">
            <div className="summary-row">
              <span>Status</span>
              <strong>{order.status}</strong>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>₹{order.total_amount}</strong>
            </div>

            {/* Addresses (these are StringRelatedField in your serializer) */}
            {order.shipping_address && (
              <div className="summary-block">
                <h3>Shipping Address</h3>
                <p>{order.shipping_address}</p>
              </div>
            )}

            {order.billing_address && (
              <div className="summary-block">
                <h3>Billing Address</h3>
                <p>{order.billing_address}</p>
              </div>
            )}

            {/* Items */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="summary-block">
                <h3>Items</h3>
                <div className="items-list">
                  {order.items.map((it, idx) => (
                    <div className="item-row" key={idx}>
                      <div>
                        <strong>{it.product_name}</strong>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          Qty: {it.quantity} • ₹{it.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="order-actions">
          <button onClick={() => navigate("/account/orders")}>View My Orders</button>

          {/* ✅ Track button */}
          {orderId && (
            <button className="secondary" onClick={() => navigate(`/track-order/${orderId}`)}>
              Track Order
            </button>
          )}

          <button className="secondary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

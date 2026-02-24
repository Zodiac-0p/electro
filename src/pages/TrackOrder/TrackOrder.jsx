import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./TrackOrder.css";

const TrackOrder = () => {
  const { id: urlId } = useParams(); // works only if route has /track-order/:id

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  const formatAddress = (a) => {
    if (!a) return "Not available";
    return `${a.full_name}
${a.phone_number}
${a.street_address}
${a.city}, ${a.state} - ${a.postal_code}
${a.country}`;
  };

  const fetchTracking = async (id) => {
    const cleanId = String(id).trim();
    if (!cleanId) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const base = import.meta.env.VITE_API_BASE; // e.g. http://127.0.0.1:8000/api
      const url = `${base}/user/track-order/${cleanId}/`;
      // const url = `http://127.0.0.1:8000/api/user/track-order/${cleanId}/`;

      const res = await axios.get(url);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 404) setError("Order not found.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ If opened like /track-order/104 -> auto set input + auto fetch
  useEffect(() => {
    if (!urlId) return;
    setOrderId(urlId);
    fetchTracking(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  const handleTrack = (e) => {
    e.preventDefault();
    fetchTracking(orderId);
  };

  return (
    <div className="track-order-page">
      <div className="container">
        <h1>Track Your Order</h1>

        <form className="track-form" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="Enter Order ID (example: 104)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button type="submit" className="track-btn" disabled={loading}>
  {loading ? "Tracking..." : "Track"}
</button>
        </form>

        {error && <p className="error">{error}</p>}

        {order && (
          <div className="tracking-result">
            <div className="track-head">
              <h2>Order #{order.order_id}</h2>
              <span className={`status-badge ${order.status}`}>
                {order.status}
              </span>
            </div>

            <div className="track-meta">
              <div>
                <span>Total</span>
                <strong>₹{order.total_amount}</strong>
              </div>
              <div>
                <span>Ordered on</span>
                <strong>{formatDate(order.created_at)}</strong>
              </div>
            </div>

            <div className="track-sections">
              <div className="track-card">
                <h3>Shipping Address</h3>
                <pre className="addr">
                  {formatAddress(order.shipping_address)}
                </pre>
              </div>

              <div className="track-card">
                <h3>Billing Address</h3>
                <pre className="addr">
                  {formatAddress(order.billing_address)}
                </pre>
              </div>
            </div>

            <div className="track-card">
              <h3>Items</h3>
              {order.items?.length ? (
                <div className="items">
                  {order.items.map((it, idx) => (
                    <div className="item-row" key={idx}>
                      <div>
                        <div className="item-name">{it.product_name}</div>
                        <div className="item-sub">
                          Product ID: {it.product_id} • Qty: {it.quantity}
                        </div>
                      </div>
                      <div className="item-price">₹{it.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No items found.</p>
              )}
            </div>

            {order.payment && (
              <div className="track-card">
                <h3>Payment</h3>
                <p>
                  Status: <strong>{order.payment.status}</strong>
                </p>
                <p>
                  Amount: <strong>₹{order.payment.amount}</strong>
                </p>
                {order.payment.razorpay_order_id && (
                  <p>Razorpay Order ID: {order.payment.razorpay_order_id}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;

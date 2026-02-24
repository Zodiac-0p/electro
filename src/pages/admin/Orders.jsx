import { useEffect, useState } from "react";
import adminApi from "../../services/adminApi";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null); // ✅ modal data

  useEffect(() => {
    loadOrders("users/orders/");
  }, []);

  const loadOrders = (url) => {
    setLoading(true);

    const request = url?.startsWith("http")
      ? adminApi.get(url.replace("http://127.0.0.1:8000/api/admin/", ""))
      : adminApi.get(url);

    request
      .then((res) => {
        setOrders(res.data.results || []);
        setNext(res.data.next);
        setPrevious(res.data.previous);
        setCount(res.data.count);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    await adminApi.patch(`users/orders/${id}/update_status/`, { status });

    // ✅ update UI instantly without full reload
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );

    // ✅ update modal if open
    setSelectedOrder((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Orders</h1>
        <p>Total Orders: <b>{count}</b></p>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const paymentText = order.payment
                  ? `${order.payment.payment_method} (${order.payment.status})`
                  : "COD";

                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td className="truncate" title={order.user_email}>
                      {order.user_email}
                    </td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td className="truncate" title={paymentText}>
                      {paymentText}
                    </td>
                    <td>₹{order.total_amount}</td>

                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="orders-pagination">
        <button
          className="pager-btn"
          disabled={!previous}
          onClick={() => loadOrders(previous)}
        >
          Previous
        </button>
        <button
          className="pager-btn"
          disabled={!next}
          onClick={() => loadOrders(next)}
        >
          Next
        </button>
      </div>

      {/* ✅ Modal Details */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="grid-2">
                <div className="info-box">
                  <div className="label">User</div>
                  <div className="value">{selectedOrder.user_email}</div>
                </div>
                <div className="info-box">
                  <div className="label">Date</div>
                  <div className="value">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="info-box">
                  <div className="label">Payment</div>
                  <div className="value">
                    {selectedOrder.payment
                      ? `${selectedOrder.payment.payment_method} (${selectedOrder.payment.status})`
                      : "Cash on Delivery"}
                  </div>
                </div>
                <div className="info-box">
                  <div className="label">Total</div>
                  <div className="value">₹{selectedOrder.total_amount}</div>
                </div>
              </div>

              <div className="section">
                <h3>Addresses</h3>
                <div className="grid-2">
                  <div className="address">
                    <h4>Billing</h4>
                    <p>
                      {selectedOrder.billing_address?.full_name}<br />
                      {selectedOrder.billing_address?.street_address}<br />
                      {selectedOrder.billing_address?.city},{" "}
                      {selectedOrder.billing_address?.state} -{" "}
                      {selectedOrder.billing_address?.postal_code}<br />
                      {selectedOrder.billing_address?.country}
                    </p>
                  </div>

                  <div className="address">
                    <h4>Shipping</h4>
                    <p>
                      {selectedOrder.shipping_address?.full_name}<br />
                      {selectedOrder.shipping_address?.street_address}<br />
                      {selectedOrder.shipping_address?.city},{" "}
                      {selectedOrder.shipping_address?.state} -{" "}
                      {selectedOrder.shipping_address?.postal_code}<br />
                      {selectedOrder.shipping_address?.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>Items</h3>
                <div className="items-table-wrap">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ width: 90 }}>Qty</th>
                        <th style={{ width: 120 }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="section">
                <h3>Status</h3>
                <select
                  className="status-select big"
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

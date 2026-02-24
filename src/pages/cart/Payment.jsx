import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";
import { useCart } from "../../context/CartContext";
import {
  createAddress,
  fetchAddresses,
  deleteAddress,
  apiFetch,
} from "../../services/api";
import { X } from "lucide-react";


const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  // ---------- STATE ----------
  const [billing, setBilling] = useState({
    full_name: "",
    phone_number: "",
    company_name: "",
    gst_number: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [shipping, setShipping] = useState({
    full_name: "",
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState(null);

  const [shipDifferent, setShipDifferent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- LOAD SAVED ADDRESSES ----------
  useEffect(() => {
    const loadAddresses = async () => {
      const data = await fetchAddresses();
      setSavedAddresses(data);
    };
    loadAddresses();
  }, []);

  // ---------- ADDRESS HANDLERS ----------
  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
    setSelectedBillingId(null);
  };

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    setSelectedShippingId(null);
  };

  const handleSelectAddress = (address, type) => {
    if (type === "billing") {
      setBilling(address);
      setSelectedBillingId(address.id);
    } else {
      setShipping(address);
      setSelectedShippingId(address.id);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await deleteAddress(id);
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedBillingId === id) setSelectedBillingId(null);
    if (selectedShippingId === id) setSelectedShippingId(null);
  };

  const handleSaveAddress = async (type) => {
    setLoading(true);
    setError("");

    try {
      const data = type === "billing" ? billing : shipping;
      const saved = await createAddress({
        ...data,
        address_type: type,
        is_default: type === "billing",
      });

      setSavedAddresses((prev) => [...prev, saved]);

      if (type === "billing") setSelectedBillingId(saved.id);
      else setSelectedShippingId(saved.id);
    } catch {
      setError("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // ---------- RAZORPAY SCRIPT LOADER ----------
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ---------- PLACE ORDER ----------
  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (cartItems.length === 0) {
        setError("Your cart is empty");
        return;
      }

      // ---------- BILLING ----------
      let billingAddressId;
      if (selectedBillingId) {
        billingAddressId = selectedBillingId;
      } else {
        const createdBilling = await createAddress({
          ...billing,
          address_type: "billing",
          is_default: true,
        });
        billingAddressId = createdBilling.id;
        setSavedAddresses((prev) => [...prev, createdBilling]);
      }

      // ---------- SHIPPING ----------
      let shippingAddressId;
      if (shipDifferent) {
        if (selectedShippingId) {
          shippingAddressId = selectedShippingId;
        } else {
          const createdShipping = await createAddress({
            ...shipping,
            address_type: "shipping",
            is_default: false,
          });
          shippingAddressId = createdShipping.id;
          setSavedAddresses((prev) => [...prev, createdShipping]);
        }
      } else {
        shippingAddressId = billingAddressId;
      }

      // // ---------- CREATE ORDER ----------
      // const payload = {
      //   billing_address: billingAddressId,
      //   shipping_address: shippingAddressId,
      //   payment_method: paymentMethod,
      //   status: paymentMethod === "cod" ? "confirmed" : "pending",
      // };

      
      // ---------- COD FLOW ----------
      if (paymentMethod === "cod") {
        const response = await apiFetch(
          "/user/orders/create/",
          "POST",
          {
            billing_address: billingAddressId,
            shipping_address: shippingAddressId,
            payment_method: "cod",
            status: "confirmed",
          },
          true
        );

        // Robustly pick order id from possible shapes
        const createdOrderId =
          response?.id || response?.order_id || response?.data?.id || response?.data?.order_id || "";

        if (createdOrderId) {
          localStorage.setItem("lastOrderId", String(createdOrderId));
          clearCart();
          navigate(`/order-success/${createdOrderId}`);
          return;
        }

        // fallback: store entire response and navigate without id
        console.error("Order created but no id found:", response);
        clearCart();
        navigate(`/order-success`);
        return;
      }
// ---------- RAZORPAY ORDER (PENDING ONLY) ----------
// ✅ Create Razorpay order (NO DB order)
const razorpayData = await apiFetch(
  "/payments/create-razorpay-order/",
  "POST",
  {},
  true
);


      // ---------- RAZORPAY FLOW ----------
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        setError("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: razorpayData.key, // Razorpay key sent from backend
        amount: razorpayData.amount, // in paise
        currency: "INR",
        name: "My Store",
        description: "Order Payment",
        order_id: razorpayData.razorpay_order_id,
        handler: async function (paymentResponse) {
          try {
            // Verify payment
            const verifyResponse = await apiFetch(
  "/users/verify/",
  "POST",
  {
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature,
    billing_address: billingAddressId,
    shipping_address: shippingAddressId,
  },
  true
);


            clearCart();
            const verifiedOrderId = verifyResponse?.order_id || verifyResponse?.id || verifyResponse?.data?.order_id || verifyResponse?.data?.id || "";
            if (verifiedOrderId) {
              localStorage.setItem("lastOrderId", String(verifiedOrderId));
              navigate(`/order-success/${verifiedOrderId}`);
            } else {
              console.error("Payment verified but no order id:", verifyResponse);
              navigate(`/order-success`);
            }

          } catch (err) {
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: billing.full_name,
          contact: billing.phone_number,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- JSX ----------
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <form onSubmit={placeOrder} className="checkout-grid">
        <div className="checkout-form">
          <h2>Billing Details</h2>

          {savedAddresses
            .filter((addr) => addr.address_type === "billing")
            .map((addr) => (
              <div className="address-row">
                <div className="address-left">
                  <input
                    type="radio"
                    checked={selectedBillingId === addr.id}
                    onChange={() => handleSelectAddress(addr, "billing")}
                  />

                  <div className="address-text">
                    {addr.street_address}, {addr.city}, {addr.state} – {addr.postal_code}
                  </div>
                </div>
                <div className="address-actions">
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    aria-label="Delete address"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

          <input
            name="full_name"
            value={billing.full_name}
            onChange={handleBillingChange}
            placeholder="Full Name"
            required
          />
          <input
            name="phone_number"
            value={billing.phone_number}
            onChange={handleBillingChange}
            placeholder="Phone Number"
            required
          />
          <input
            name="street_address"
            value={billing.street_address}
            onChange={handleBillingChange}
            placeholder="Street Address"
            required
          />
          <input
            name="city"
            value={billing.city}
            onChange={handleBillingChange}
            placeholder="City"
            required
          />
          <input
            name="state"
            value={billing.state}
            onChange={handleBillingChange}
            placeholder="State"
            required
          />
          <input
            name="postal_code"
            value={billing.postal_code}
            onChange={handleBillingChange}
            placeholder="Pincode"
            required
          />

          <button type="button" onClick={() => handleSaveAddress("billing")}>
            Save Billing Address
          </button>

          <label>
            <input
              type="checkbox"
              checked={shipDifferent}
              onChange={() => setShipDifferent(!shipDifferent)}
            />
            Ship to a different address
          </label>

          {shipDifferent && (
            <>
              <h2>Shipping Details</h2>

              <input
                name="full_name"
                value={shipping.full_name}
                onChange={handleShippingChange}
                placeholder="Full Name"
                required
              />
              <input
                name="phone_number"
                value={shipping.phone_number}
                onChange={handleShippingChange}
                placeholder="Phone Number"
                required
              />
              <input
                name="street_address"
                value={shipping.street_address}
                onChange={handleShippingChange}
                placeholder="Street Address"
                required
              />
              <input
                name="city"
                value={shipping.city}
                onChange={handleShippingChange}
                placeholder="City"
                required
              />
              <input
                name="state"
                value={shipping.state}
                onChange={handleShippingChange}
                placeholder="State"
                required
              />
              <input
                name="postal_code"
                value={shipping.postal_code}
                onChange={handleShippingChange}
                placeholder="Pincode"
                required
              />

              <button
                type="button"
                onClick={() => handleSaveAddress("shipping")}
              >
                Save Shipping Address
              </button>
            </>
          )}

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="razorpay">Online Payment</option>
          </select>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Placing Order..."
              : `Place Order ₹${getTotalPrice().toFixed(2)}`}
          </button>
        </div>

        <div className="order-summary">
          <h2>Your Order</h2>
          {cartItems.map((item) => (
            <div key={item.cartItemId}>
              {item.name} × {item.quantity}
            </div>
          ))}

          <strong>Total ₹{getTotalPrice().toFixed(2)}</strong>
        </div>
      </form>
    </div>
  );
};

export default Payment;
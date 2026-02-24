import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

const Cart = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart();

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading cart...</h2>;
  }

  // ================= EMPTY CART =================
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>

          <Link to="/AllProducts" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ================= CART WITH ITEMS =================
  return (
    <div className="cart-container">
      <h1>Your Shopping Cart</h1>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="cart-item">
            {/* IMAGE */}
            <div className="item-image">
              <img
                src={
                  item.images?.[0]?.image ||
                  "https://via.placeholder.com/100"
                }
                alt={item.name}
              />
            </div>

            {/* DETAILS */}
            <div className="item-details">
              <h3>{item.name}</h3>
              {item.brand && (
                <p className="item-brand">{item.brand.name}</p>
              )}
              <p className="item-price">₹{item.price.toFixed(2)}</p>
            </div>

            {/* QUANTITY + REMOVE (INLINE) */}
            <div className="item-quantity">
              <button
                className="quantity-btn"
                onClick={() =>
                  updateQuantity(item.cartItemId, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>

              <span className="quantity-display">{item.quantity}</span>

              <button
                className="quantity-btn"
                onClick={() =>
                  updateQuantity(item.cartItemId, item.quantity + 1)
                }
              >
                +
              </button>

              <button
                className="remove-item-btn"
                onClick={() => removeFromCart(item.cartItemId)}
              >
                Remove
              </button>
            </div>

            {/* ITEM TOTAL */}
            <div className="item-total">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="cart-summary">
        <h3>Total: ₹{getTotalPrice().toFixed(2)}</h3>

        <div className="cart-actions">
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>

          <Link to="/AllProducts" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

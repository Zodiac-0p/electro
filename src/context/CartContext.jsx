import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Global toast popup state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success | error | info
  });

  const closeToast = () => setToast((p) => ({ ...p, show: false }));

  const showToast = (message, type = "success", duration = 2200) => {
    setToast({ show: true, message, type });

    // clear previous timeout
    if (showToast._t) clearTimeout(showToast._t);

    showToast._t = setTimeout(() => {
      setToast((p) => ({ ...p, show: false }));
    }, duration);
  };

  // ================= FETCH CART =================
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/user/cart/", "GET", null, true);

      if (!data || !Array.isArray(data.items)) {
        setCartItems([]);
        return;
      }

      const mappedCart = await Promise.all(
        data.items.map(async (item) => {
          const product = await apiFetch(
            `/catalog/products/${item.product.id}/`,
            "GET",
            null,
            true
          );

          return {
            cartItemId: item.id,
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: item.quantity,
            images: product.images,
            brand: product.brand,
            stock: product.stock,
            description: product.description,
          };
        })
      );

      setCartItems(mappedCart);
    } catch (err) {
      console.error("Failed to fetch cart", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ================= ADD TO CART =================
  const addToCart = async (product, quantity = 1) => {
    try {
      await apiFetch(
        "/user/cart/add/",
        "POST",
        { product: product.id, quantity },
        true
      );

      showToast(`Added "${product.name}" to cart ✅`, "success");
      await fetchCart();
      return true;
    } catch (err) {
      console.error("Failed to add to cart", err);
      showToast("Failed to add to cart ❌", "error");
      return false;
    }
  };

  // ================= REMOVE =================
  const removeFromCart = async (cartItemId) => {
    try {
      await apiFetch(`/user/cart/remove/${cartItemId}/`, "DELETE", null, true);
      showToast("Removed from cart 🗑️", "info");
      await fetchCart();
      return true;
    } catch (err) {
      console.error("Failed to remove from cart", err);
      showToast("Failed to remove ❌", "error");
      return false;
    }
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    // optimistic UI
    setCartItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i
      )
    );

    const diff = newQuantity - item.quantity;
    if (diff === 0) return;

    try {
      await apiFetch(
        "/user/cart/add/",
        "POST",
        { product: item.productId, quantity: diff },
        true
      );
    } catch (err) {
      console.error("Failed to update quantity", err);
      showToast("Quantity update failed ❌", "error");
      await fetchCart(); // rollback
    }
  };

  // ================= CLEAR CART =================
  const clearCart = () => {
    setCartItems([]);
    showToast("Cart cleared ✅", "info");
  };

  // ================= TOTALS =================
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,

        // ✅ toast
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

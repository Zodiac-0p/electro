import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./ProductGrid.css";

const ProductGrid = ({ products }) => {
  const { addToCart } = useCart();

  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    text: "",
    type: "success",
  });

  const getQuantity = (productId) => quantities[productId] || 1;

  const increaseQty = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const decreaseQty = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1),
    }));
  };

  const showToast = (text, type = "success") => {
    setToast({ visible: true, text, type });

    if (showToast._t) clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      setToast({ visible: false, text: "", type: "success" });
    }, 2200);
  };

  return (
    <>
      <div className="pg-product-grid">
        {products?.length > 0 ? (
          products.map((product) => {
            const selectedQty = getQuantity(product.id);

            return (
              <div className="pg-product-card" key={product.id}>
                <Link to={`/product/${product.id}`} className="pg-product-link">
                  <div className="pg-product-image-container">
                    <img
                      src={
                        product.images?.[0]?.image ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={product.images?.[0]?.alt_text || product.name}
                      className="pg-product-image"
                    />
                  </div>

                  <div className="pg-product-info">
                    {product.brand && (
                      <span className="pg-brand">{product.brand.name}</span>
                    )}

                    <p className="pg-product-name">{product.name}</p>

                    <p className="pg-product-description">
                      {product.description?.length > 60
                        ? product.description.slice(0, 60) + "..."
                        : product.description || "High-quality product"}
                    </p>

                    <div className="pg-product-price">
                      ₹{parseFloat(product.price).toFixed(2)}{" "}
                      <span className="pg-tax">ex. GST</span>
                    </div>

                    <span
                      className={`pg-stock-badge ${
                        product.stock > 0 ? "pg-in-stock" : "pg-out-stock"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </Link>

                {product.stock > 0 && (
                  <div className="pg-cart-actions">
                    <div className="pg-quantity-selector">
                      <button
                        className="pg-quantity-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          decreaseQty(product.id);
                        }}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        className="pg-quantity-input"
                        value={selectedQty}
                        readOnly
                      />

                      <button
                        className="pg-quantity-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          increaseQty(product.id);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="pg-add-to-cart-btn"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          await addToCart(product, selectedQty);
                          showToast("Added to cart ✅", "success");
                        } catch (err) {
                          showToast("Failed to add to cart ❌", "error");
                        }
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {toast.visible && (
        <div className={`pg-toast ${toast.type}`}>{toast.text}</div>
      )}
    </>
  );
};

export default ProductGrid;

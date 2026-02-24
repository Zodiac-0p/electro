import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchReviewsByProduct,
  createReview,
  fetchSuggestedProducts,
} from "../../services/api";
import { useCart } from "../../context/CartContext";
import "./ProductPage.css";

const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="stars">
      {stars.map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            className={`star ${active ? "active" : ""} ${
              readOnly ? "readonly" : ""
            }`}
            onClick={() => (!readOnly ? onChange?.(star) : null)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);

  // ✅ reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // ✅ suggested
  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  // ✅ load product
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [productId]);

  // ✅ load reviews
  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await fetchReviewsByProduct(productId);
        const list = Array.isArray(data) ? data : data?.results || [];
        setReviews(list);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [productId]);

  // ✅ load suggested products (after product loads)
  useEffect(() => {
    const loadSuggested = async () => {
      if (!product?.category?.id) return;
      setSuggestedLoading(true);
      try {
        const data = await fetchSuggestedProducts({
          categoryId: product.category.id,
          excludeId: product.id,
          limit: 8,
        });
        setSuggested(data?.results || data || []);
      } catch {
        setSuggested([]);
      } finally {
        setSuggestedLoading(false);
      }
    };
    loadSuggested();
  }, [product]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (!reviewRating) return setReviewError("Please select a rating.");
    if (!reviewComment.trim()) return setReviewError("Please write a comment.");

    setReviewSubmitting(true);
    try {
      const created = await createReview(productId, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviews((prev) => [created, ...prev]);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      setReviewError("Failed to submit review. Please login and try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading product...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="error">Product not found.</p>;

  const mainImage =
    product.images?.length > 0
      ? product.images[0].image
      : "https://via.placeholder.com/500x400?text=No+Image";

  return (
    <div className="product-page">
      <div className="product-container">
        {/* Left */}
        <div className="product-image-section">
          <img src={mainImage} alt={product.name} className="product-main-image" />
        </div>

        {/* Right */}
        <div className="product-details-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="rating-row">
            <StarRating value={Math.round(avgRating)} readOnly />
            <span className="rating-meta">
              {avgRating ? avgRating.toFixed(1) : "0.0"} / 5 ({reviews.length} reviews)
            </span>
          </div>

          {product.brand && (
            <span className="product-brand">Brand: {product.brand.name}</span>
          )}

          <div className="product-pricing">
            <span className="price">₹{parseFloat(product.price).toFixed(2)}</span>
            {product.discount_price && (
              <span className="discount-price">
                ₹{parseFloat(product.discount_price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock})</span>
            ) : (
              <span className="out-stock">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="quantity-selector">
              <button
                onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                className="quantity-btn"
              >
                -
              </button>

              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) =>
                  setQuantity(Math.max(parseInt(e.target.value) || 1, 1))
                }
                className="quantity-input"
              />

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
          )}

          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product, quantity)}
            disabled={product.stock <= 0}
          >
            Add to Cart
          </button>
          <p className="product-description"><b><u>Description</u></b><br>
          </br>{product.description}</p>
          
          {/* ✅ Reviews */}
          <div className="reviews-section">
            <h2 className="section-title">Ratings & Reviews</h2>

            <form className="review-form" onSubmit={handleSubmitReview}>
              <label className="label">Your rating</label>
              <StarRating value={reviewRating} onChange={setReviewRating} />

              <label className="label">Your comment</label>
              <textarea
                className="review-textarea"
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your review here..."
              />

              {reviewError && <p className="error small">{reviewError}</p>}

              <button className="review-submit" disabled={reviewSubmitting}>
                {reviewSubmitting ? "Submitting..." : "Post Review"}
              </button>
            </form>

            <div className="review-list">
              {reviewsLoading ? (
                <p className="muted">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="muted">No reviews yet.</p>
              ) : (
                reviews.map((r) => (
                  <div className="review-card" key={r.id}>
                    <div className="review-top">
                      <StarRating value={Number(r.rating) || 0} readOnly />
                      <span className="review-user">
                        {r.user?.username || r.user_name || "User"}
                      </span>
                      <span className="review-date">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ✅ Suggested */}
          <div className="suggested-section">
            <h2 className="section-title">Related Products</h2>

            {suggestedLoading ? (
              <p className="muted">Loading suggestions...</p>
            ) : suggested.length === 0 ? (
              <p className="muted">No suggestions.</p>
            ) : (
              <div className="suggested-grid">
                {suggested.map((p) => {
                  const img =
                    p.images?.length > 0
                      ? p.images[0].image
                      : "https://via.placeholder.com/280x200?text=No+Image";

                  return (
                    <Link key={p.id} to={`/products/${p.id}`} className="suggested-card">
                      <img src={img} alt={p.name} className="suggested-img" />
                      <div className="suggested-info">
                        <div className="suggested-name">{p.name}</div>
                        <div className="suggested-price">
                          ₹{parseFloat(p.price).toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
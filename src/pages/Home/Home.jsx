import React, { useEffect, useMemo, useState } from "react";
import Hero from "../../components/Hero/Hero";
import Categories from "../../components/categories/Categories";
import FeatureCards from "../../components/FeatureCards/FeatureCards";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

import { fetchFeaturedProducts, fetchLatestProducts } from "../../services/api";

import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Login success message
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // ✅ change (8 = 4 columns x 2 rows)

  useEffect(() => {
    const msg = localStorage.getItem("loginSuccessMsg");
    if (msg) {
      setSuccessMsg(msg);
      localStorage.removeItem("loginSuccessMsg");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }, []);

  useEffect(() => {
    loadHomeProducts();
  }, []);

  const loadHomeProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [featured, latest] = await Promise.all([
        fetchFeaturedProducts(50), // ✅ fetch more so pagination has items
        fetchLatestProducts(50),
      ]);

      setFeaturedProducts(featured || []);
      setLatestProducts(latest || []);
    } catch (err) {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const products = activeTab === "featured" ? featuredProducts : latestProducts;

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="home">
      {successMsg && <div className="success-toast">{successMsg}</div>}

      <Hero />
      <Categories />
      <FeatureCards />

      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <h2>
              {activeTab === "featured" ? "Featured Products" : "Latest Products"}
            </h2>

            <div className="category-tabs">
              <button
                className={`tab-button ${activeTab === "featured" ? "active" : ""}`}
                onClick={() => setActiveTab("featured")}
              >
                FEATURED
              </button>

              <button
                className={`tab-button ${activeTab === "latest" ? "active" : ""}`}
                onClick={() => setActiveTab("latest")}
              >
                LATEST
              </button>
            </div>
          </div>

          {loading && <p>Loading products...</p>}
          {!loading && error && <p className="error">{error}</p>}

          {!loading && !error && products.length === 0 && <p>No products found.</p>}
          
          {!loading && !error && products.length > 0 && (
            <>
              <ProductGrid products={paginatedProducts} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={goPrev}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>

                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={goNext}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { fetchProductsByCategory } from "../../services/api";
import "./CategoryPage.css";

// Category names mapping to display to user
const categoryNames = {
  1: "DEV BOARDS",
  2: "BATTERIES",
  3: "COMPONENTS",
  4: "ICS",
  5: "SENSORS",
  6: "MODULES",
  7: "TOOLS",
  8: "RESISTOR",
  9: "TRANSISTOR",
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProductsByCategory(categoryId);
        setAllProducts(data.results || data);
      } catch (err) {
        console.error("Error fetching category products:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId]);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const getPageButtons = () => {
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  const categoryName = categoryNames[categoryId] || `Category ${categoryId}`;

  return (
    <div className="category-page-container">
      <div className="container">
        <h1 className="category-page-title">{categoryName}</h1>

        {loading && <p className="loading-text">Loading products...</p>}
        {error && <p className="error-text">Error: {error}</p>}

        {!loading && !error && (
          <>
            {allProducts && allProducts.length > 0 ? (
              <>
                <p className="product-count">{allProducts.length} products found</p>
                <ProductGrid products={paginatedProducts} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={goPrev} disabled={page === 1} className="pagination-btn">
                      ← Prev
                    </button>

                    <div className="page-buttons">
                      {getPageButtons().map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`page-button ${p === page ? "active" : ""}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button onClick={goNext} disabled={page === totalPages} className="pagination-btn">
                      Next →
                    </button>

                    <span className="pagination-info">
                      Page <b>{page}</b> of <b>{totalPages}</b>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="no-products">No products found in this category.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

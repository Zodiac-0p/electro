import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProductGrid from "../ProductGrid/ProductGrid";
import { searchProducts } from "../../services/api";
import "./SearchResultsPage.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const queryParams = useQuery();
  const query = queryParams.get("query") || "";
  const category = queryParams.get("category") || "";
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await searchProducts(query, category, 100);
        setAllProducts(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, category]);

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

  return (
    <div className="search-results-page">
      <div className="container">
        <h2 className="search-title">Search Results for "{query}"</h2>
        {allProducts.length > 0 && (
          <p className="search-count">{allProducts.length} results found</p>
        )}

        {loading ? (
          <p className="loading-msg">Loading...</p>
        ) : allProducts.length === 0 ? (
          <p className="no-results">No products found for "{query}"</p>
        ) : (
          <>
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
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;


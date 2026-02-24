import React, { useEffect, useState } from "react";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { fetchProducts } from "../../services/api";
import "./AllProducts.css";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12; // 4 columns x 3 rows

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ backend pagination
        const data = await fetchProducts({ page, page_size: PAGE_SIZE });

        setProducts(Array.isArray(data?.results) ? data.results : []);
        setCount(typeof data?.count === "number" ? data.count : 0);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setProducts([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ✅ page buttons (like 1 2 3 4 ...)
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
    <div className="all-products-page">
      <h1 className="all-products-title">All Products</h1>

      {loading && <p className="all-products-msg">Loading products...</p>}
      {!loading && error && <p className="all-products-error">{error}</p>}

      {!loading && !error && <ProductGrid products={products} />}

      {/* ✅ Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <button onClick={goPrev} disabled={page === 1}>
            Prev
          </button>

          {getPageButtons().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? "active" : ""}
            >
              {p}
            </button>
          ))}

          <button onClick={goNext} disabled={page === totalPages}>
            Next
          </button>

          <span className="page-info">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
        </div>
      )}
    </div>
  );
};

export default AllProducts;

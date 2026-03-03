import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { fetchProductsByCategory, fetchCategories } from "../../services/api";
import "./CategoryPage.css";


const CategoryPage = () => {
  const { categoryId } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(`Category ${categoryId}`);
  const [categories, setCategories] = useState([]); // top-level categories for nav
  const [catsLoading, setCatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    const loadName = async () => {
      try {
        // fetch flat list so we can find any category by id
        const data = await fetchCategories(true);
        const list = data.results || data || [];
        const found = list.find((c) => String(c.id) === String(categoryId));
        if (found) setCategoryName(found.name);
        else setCategoryName(`Category ${categoryId}`);
      } catch (err) {
        setCategoryName(`Category ${categoryId}`);
      }
    };

    if (categoryId) loadName();
  }, [categoryId]);

  // load top-level categories (includes children)
  useEffect(() => {
    const loadCats = async () => {
      try {
        setCatsLoading(true);
        const data = await fetchCategories(); // default returns top-level with children
        const list = data.results || data || [];
        setCategories(list);
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };

    loadCats();
  }, []);

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

  // categoryName state is used above

  return (
    <div className="category-page-container">
      <div className="container">
        <h1 className="category-page-title">{categoryName}</h1>

        <div className="category-list">
          {catsLoading ? (
            <p className="loading-text">Loading categories...</p>
          ) : (
            <div className="category-chips">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/category/${c.id}`}
                  className={`category-chip ${String(c.id) === String(categoryId) ? "active" : ""}`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          )}
        </div>

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

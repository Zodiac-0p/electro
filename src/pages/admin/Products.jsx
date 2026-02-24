import { useEffect, useMemo, useState } from "react";
import adminApi from "../../services/adminApi";
import { Link } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  // ✅ EDIT MODAL STATES
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    discount_price: "",
    stock: "",
    description: "",
  });

  // ✅ Image replace (edit image) states
  const [currentImage, setCurrentImage] = useState(""); // old image url
  const [editImageFile, setEditImageFile] = useState(null); // new file (optional)
  const [editImagePreview, setEditImagePreview] = useState(""); // preview of new file (optional)

  useEffect(() => {
    loadProducts("catalog/products/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeEndpoint = (url) => {
    if (!url) return null;
    return url.startsWith("http")
      ? url.replace("http://127.0.0.1:8000/api/admin/", "")
      : url;
  };

  const loadProducts = async (url) => {
    setLoading(true);
    setError("");

    try {
      const endpoint = normalizeEndpoint(url);
      const res = await adminApi.get(endpoint);

      setProducts(res.data.results || []);
      setNext(res.data.next);
      setPrevious(res.data.previous);
      setCount(res.data.count ?? 0);
    } catch (e) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await adminApi.delete(`catalog/products/${id}/`);
      loadProducts("catalog/products/");
    } catch (e) {
      alert("Failed to delete product.");
    }
  };

  // ✅ frontend search
  const filteredProducts = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return products;
    return products.filter((p) => (p.name || "").toLowerCase().includes(text));
  }, [products, q]);

  // ✅ OPEN EDIT MODAL
  const openEdit = (product) => {
    setEditError("");
    setEditingId(product.id);

    setEditForm({
      name: product.name || "",
      price: product.price ?? "",
      discount_price: product.discount_price ?? "",
      stock: product.stock ?? "",
      description: product.description || "",
    });

    // ✅ old image preview (use images[0].image or fallback product.image)
    const oldImg = product?.images?.[0]?.image || product?.image || "";
    setCurrentImage(oldImg);

    // reset new selection
    setEditImageFile(null);
    setEditImagePreview("");

    setEditOpen(true);
  };

  // ✅ CLOSE EDIT MODAL
  const closeEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
    setEditError("");
    setEditingId(null);

    // cleanup
    setCurrentImage("");
    setEditImageFile(null);
    setEditImagePreview("");
  };

  // ✅ select new image (replaces old)
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditImageFile(file);

    const url = URL.createObjectURL(file);
    setEditImagePreview(url);
  };

  // ✅ remove selected new image (go back to old preview)
  const clearSelectedImage = () => {
    setEditImageFile(null);
    setEditImagePreview("");
  };

  // ✅ SAVE EDIT (only send image if selected)
  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editForm.name.trim()) return setEditError("Name is required.");
    if (editForm.price === "" || Number(editForm.price) < 0)
      return setEditError("Price must be valid.");

    setEditSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      formData.append("description", editForm.description?.trim() || "");
      formData.append("price", String(Number(editForm.price)));
      formData.append(
        "discount_price",
        editForm.discount_price === "" ? "" : String(Number(editForm.discount_price))
      );
      formData.append("stock", String(editForm.stock === "" ? 0 : Number(editForm.stock)));

      // ✅ only if user picked a new image -> replace old
      // IMPORTANT: If backend field is not "image", rename it to your field name.
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const res = await adminApi.patch(`catalog/products/${editingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data;

      // ✅ update product list instantly
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p))
      );

      setEditOpen(false);
      setEditingId(null);
    } catch (err) {
      setEditError(
        "Failed to update product. If image not updating, backend field name may be different (image/thumbnail/photo)."
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ✅ ESC close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && editOpen) closeEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editOpen, editSaving]);

  return (
    <div className="admin-page">
      {/* Header row */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Products</h1>
          <p className="admin-subtitle">Total products: {count}</p>
        </div>

        <div className="admin-actions">
          <Link to="/admin/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Search + refresh */}
      <div className="toolbar">
        <div className="search-wrap">
          <input
            className="search-input"
            placeholder="Search product name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button className="clear-btn" onClick={() => setQ("")}>
              Clear
            </button>
          )}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => loadProducts("catalog/products/")}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* States */}
      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-loading">Loading products…</div>}

      {!loading && filteredProducts.length === 0 && (
        <div className="empty-box">
          <h3>No products found</h3>
          <p>Try changing the search or add a new product.</p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredProducts.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Name</th>
                <th style={{ width: 140 }}>Price</th>
                <th style={{ width: 120 }}>Stock</th>
                <th style={{ width: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => (
                <tr key={p.id}>
                  <td className="muted">#{index + 1}</td>
                  <td>
                    <div className="name-cell">
                      <div className="name">{p.name}</div>
                      {p.category_name && <div className="sub">{p.category_name}</div>}
                    </div>
                  </td>
                  <td>₹{p.price}</td>
                  <td>
                    <span className={`pill ${p.stock > 0 ? "pill-ok" : "pill-bad"}`}>
                      {p.stock > 0 ? `In stock: ${p.stock}` : "Out of stock"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary" onClick={() => openEdit(p)}>
                        Edit
                      </button>

                      <button className="btn btn-danger" onClick={() => deleteProduct(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          className="btn btn-secondary"
          disabled={!previous || loading}
          onClick={() => loadProducts(previous)}
        >
          ← Previous
        </button>

        <button
          className="btn btn-secondary"
          disabled={!next || loading}
          onClick={() => loadProducts(next)}
        >
          Next →
        </button>
      </div>

      {/* ✅ EDIT MODAL */}
      {editOpen && (
        <div className="modal-overlay" onMouseDown={closeEdit}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="modal-close" onClick={closeEdit} type="button">
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={saveEdit}>
              {/* ✅ IMAGE EDIT (replace) */}
              <label className="label">Product Image</label>

              <div className="img-row">
                <div className="img-preview">
                  <img
                    src={
                      editImagePreview ||
                      currentImage ||
                      "https://via.placeholder.com/160x120?text=No+Image"
                    }
                    alt="preview"
                  />
                </div>

                <div className="img-actions">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={onPickImage}
                  />

                  {editImageFile && (
                    <div className="img-buttons">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={clearSelectedImage}
                      >
                        Remove selected
                      </button>
                    </div>
                  )}

                  <p className="img-hint">
                    Old image shows first. Choose a new file only if you want to replace it.
                  </p>
                </div>
              </div>

              <label className="label">Name</label>
              <input
                className="modal-input"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              />

              <label className="label">Description</label>
              <textarea
                className="modal-textarea"
                rows="4"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />

              <div className="modal-row">
                <div className="modal-col">
                  <label className="label">Price</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={editForm.price}
                    onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                  />
                </div>

                <div className="modal-col">
                  <label className="label">Discount Price</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={editForm.discount_price}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, discount_price: e.target.value }))
                    }
                  />
                </div>
              </div>

              <label className="label">Stock</label>
              <input
                type="number"
                className="modal-input"
                value={editForm.stock}
                onChange={(e) => setEditForm((p) => ({ ...p, stock: e.target.value }))}
              />

              {editError && <p className="error small">{editError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
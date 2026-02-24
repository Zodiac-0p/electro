import { useEffect, useMemo, useRef, useState } from "react";
import adminApi from "../../services/adminApi";
import "./Categories.css";

const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState(""); // ✅ NEW (slug required by backend)
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories("catalog/categories/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ image preview
  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // ✅ normalize next/previous from DRF (absolute URL -> relative endpoint)
  const normalizeUrl = (url) => {
    if (!url) return null;

    // if it's full url like http://127.0.0.1:8000/api/admin/catalog/categories/?page=2
    if (url.startsWith("http")) {
      const idx = url.indexOf("/api/admin/");
      if (idx !== -1) return url.slice(idx + "/api/admin/".length);
      // fallback: if backend returns /api/admin/ already
      const idx2 = url.indexOf("/api/");
      if (idx2 !== -1) return url.slice(idx2 + "/api/".length);
      return url;
    }

    // if already relative like "catalog/categories/?page=2"
    return url.replace(/^\/+/, "");
  };

  const loadCategories = async (url) => {
    setLoading(true);
    setError("");

    try {
      const endpoint = normalizeUrl(url) || "catalog/categories/";
      const res = await adminApi.get(endpoint);

      setCategories(Array.isArray(res.data?.results) ? res.data.results : []);
      setCount(res.data?.count ?? 0);
      setNext(res.data?.next ?? null);
      setPrevious(res.data?.previous ?? null);
    } catch (e) {
      console.log("LOAD CATEGORIES ERROR:", e?.response?.data || e?.message);
      const data = e?.response?.data;
      setError(data?.detail || "Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const extractErrorMessage = (data) => {
    if (!data) return "Bad Request (400). Check backend validation.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    if (typeof data === "object") {
      const key = Object.keys(data)[0];
      const val = data[key];
      const msg = Array.isArray(val) ? val[0] : String(val);
      return `${key}: ${msg}`;
    }
    return "Bad Request (400).";
  };

  // ✅ auto slug when typing name (you can still edit slug manually)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const createCategory = async () => {
    const trimmed = name.trim();

    setSuccess("");
    setError("");

    if (!trimmed) {
      setError("name: This field is required.");
      return;
    }

    // slug required by backend (your error)
    const finalSlug = (slug || "").trim() || slugify(trimmed);
    if (!finalSlug) {
      setError("slug: This field is required.");
      return;
    }

    if (creating) return;

    setCreating(true);

    try {
      const form = new FormData();
      form.append("name", trimmed);
      form.append("slug", finalSlug); // ✅ FIX: slug sent

      // ⚠️ IMPORTANT: field name must match Category model (image/logo/icon)
      // If your Category model field is NOT "image", change below to the correct name.
      if (image) form.append("image", image);

      await adminApi.post("catalog/categories/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Category added successfully!");
      setName("");
      setSlug("");
      setImage(null);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";

      await loadCategories("catalog/categories/");
    } catch (e) {
      console.log("CREATE CATEGORY ERROR:", e?.response?.data || e?.message);
      setError(extractErrorMessage(e?.response?.data));
    } finally {
      setCreating(false);
    }
  };

  const onKeyDownName = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createCategory();
    }
  };

  const shownCategories = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((c) =>
      (c?.name || "").toLowerCase().includes(query)
    );
  }, [categories, q]);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Categories</h1>
          <p className="admin-subtitle">Total categories: {count}</p>
        </div>
      </div>

      {/* Add Category */}
      <div className="cat-card">
        <div className="cat-card__left">
          <h3 className="cat-card__title">Add Category</h3>
          <p className="cat-card__desc">Create a new category for products.</p>

          {/* ✅ optional preview */}
          {preview && (
            <div className="cat-preview">
              <img src={preview} alt="preview" />
            </div>
          )}
        </div>

        <div className="cat-form">
          <input
            className="cat-input"
            placeholder="Category name (e.g., Sensors)"
            value={name}
            onChange={handleNameChange}
            onKeyDown={onKeyDownName}
            disabled={creating}
          />

          {/* ✅ slug field (auto) */}
          <input
            className="cat-input"
            placeholder="Slug (auto)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={creating}
          />

          <input
            ref={fileRef}
            className="cat-file"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            disabled={creating}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={createCategory}
            disabled={creating}
          >
            {creating ? "Adding..." : "+ Add"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadCategories("catalog/categories/")}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search categories..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="btn btn-secondary" onClick={() => setQ("")}>
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      {error && <div className="admin-alert">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {/* List */}
      {loading ? (
        <div className="admin-loading">Loading categories…</div>
      ) : shownCategories.length === 0 ? (
        <div className="empty-box">
          <h3>No categories found</h3>
          <p>Try a different search or add a new category.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>ID</th>
                <th>Name</th>
                <th style={{ width: 220 }}>Slug</th>
              </tr>
            </thead>
            <tbody>
              {shownCategories.map((c) => (
                <tr key={c.id}>
                  <td className="muted">#{c.id}</td>
                  <td className="name-cell">
                    <div className="name">{c.name}</div>
                  </td>
                  <td className="muted">{c.slug || "—"}</td>
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
          onClick={() => loadCategories(previous)}
        >
          ← Previous
        </button>

        <button
          className="btn btn-secondary"
          disabled={!next || loading}
          onClick={() => loadCategories(next)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Categories;

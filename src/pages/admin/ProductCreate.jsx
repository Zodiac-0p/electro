import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../services/adminApi";
import "./ProductCreate.css";

const slugify = (text) => {
  return (text || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const calcDiscountPrice = (price, percent) => {
  const p = Number(price);
  const d = Number(percent);

  if (!p || p <= 0) return "";
  if (!d || d <= 0) return ""; // 0% => no discount price
  if (d >= 100) return 0; // 100% => free

  const discounted = p - (p * d) / 100;
  return Math.round(discounted * 100) / 100; // 2 decimals
};

const ProductCreate = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  // ✅ track manual slug edit
  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discount_percent: "", // ✅ NEW
    discount_price: "",
    stock: "",
    category_id: "",
    brand_id: "",
    is_available: true,
    is_featured: false,
    is_latest: false, // ✅ you used this checkbox
  });

  useEffect(() => {
    adminApi.get("catalog/categories/").then((res) => {
      setCategories(res.data.results || []);
    });

    adminApi.get("catalog/brands/").then((res) => {
      setBrands(res.data.results || []);
    });
  }, []);

  useEffect(() => {
    if (!image) return setPreview("");
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ✅ if user types name and slug not manually edited, auto update slug
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slugTouched ? prev.slug : slugify(value),
      }));
      return;
    }

    // ✅ if user edits slug manually, lock it
    if (name === "slug") {
      setSlugTouched(true);
      setFormData((prev) => ({ ...prev, slug: slugify(value) }));
      return;
    }

    // ✅ Auto-calc discount_price when price or discount % changes
    if (name === "price" || name === "discount_percent") {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        next.discount_price = calcDiscountPrice(next.price, next.discount_percent);
        return next;
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        stock: Number(formData.stock),
        category: Number(formData.category_id),
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        is_latest: formData.is_latest,
      };

      if (formData.brand_id) payload.brand = Number(formData.brand_id);

      // ✅ ONLY enable this if your backend has discount_percent field
      // payload.discount_percent = formData.discount_percent
      //   ? Number(formData.discount_percent)
      //   : null;

      const productRes = await adminApi.post("catalog/products/", payload);
      const productId = productRes.data.id;

      if (image) {
        const imgData = new FormData();
        imgData.append("product", productId);
        imgData.append("image", image);

        await adminApi.post("catalog/product-images/", imgData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Product created successfully");
      navigate("/admin/products");
    } catch (err) {
      console.log("Create Product Error:", err?.response?.data);
      alert(JSON.stringify(err?.response?.data, null, 2) || "Validation error");
    }
  };

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-header">
          <div>
            <h1>Add New Product</h1>
            <p>Create product details and upload image</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="product-grid">
            {/* LEFT SIDE */}
            <div className="product-card">
              <div className="section-title">Product Information</div>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Slug</label>
                  <input
                    className="form-control"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ Price + Discount % + Discount Price */}
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Discount %</label>
                  <input
                    type="number"
                    className="form-control"
                    name="discount_percent"
                    value={formData.discount_percent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 10"
                  />
                </div>

                <div className="form-group">
                  <label>Discount Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="discount_price"
                    value={formData.discount_price}
                    readOnly
                    placeholder="Auto calculated"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <select
                    className="form-control"
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                  />{" "}
                  Available
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />{" "}
                  Featured
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="is_latest"
                    checked={formData.is_latest}
                    onChange={handleChange}
                  />{" "}
                  Latest
                </label>
              </div>

              <br />
              <button className="btn btn-primary">Create Product</button>
              <br />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="product-card">
              <div className="section-title">Product Image</div>

              <div className="image-preview">
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <div className="preview-text">No image selected</div>
                )}
              </div>

              <br />
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
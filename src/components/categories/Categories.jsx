// src/components/Categories.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Categories.css";
import { fetchCategories } from "../../services/api";
import {
  FaMicrochip,
  FaBatteryThreeQuarters,
  FaCogs,
  FaThermometerHalf,
  FaCube,
  FaTools,
  FaBolt,
  FaWifi,
  FaDesktop,
  FaBroadcastTower,
} from "react-icons/fa";

const iconMap = {
  "dev boards": <FaMicrochip />,
  power: <FaBatteryThreeQuarters />,
  components: <FaCogs />,
  microcontroller: <FaMicrochip />,
  sensors: <FaThermometerHalf />,
  tools: <FaTools />,
  resistor: <FaBolt />,
  iot: <FaWifi />,
  display: <FaDesktop />,
  communication: <FaBroadcastTower />,
  modules: <FaCube />,
};

const getMappedIcon = (name) => {
  const key = (name || "").toLowerCase();
  return iconMap[key] || null;
};

// ✅ read category icon/image from multiple possible backend field names
const getCategoryImageUrl = (cat) => {
  return (
    cat?.image_url ||
    cat?.icon_url ||
    cat?.image ||
    cat?.icon ||
    cat?.thumbnail ||
    ""
  );
};

// ✅ Letter fallback (Flipkart-like simple fallback)
const getLetter = (name) => {
  const t = (name || "").trim();
  return (t[0] || "?").toUpperCase();
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories(true); // all=true (your backend logic)
        const categoryList = data?.results || data || [];
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="categories-title">Shop by Category</h2>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => {
              const imageUrl = getCategoryImageUrl(category);
              const mappedIcon = getMappedIcon(category.name);
              const letter = getLetter(category.name);

              return (
                <div className="category-block" key={category.id}>
                  <Link to={`/category/${category.id}`} className="category-item">
                    <div className="category-icon">
                      {/* 1) Best: show uploaded image */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="category-icon-img"
                          loading="lazy"
                          onError={(e) => {
                            // If image fails, hide image so fallback shows via CSS/DOM
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <>
                          {/* 2) Optional: mapped icon for known names */}
                          {mappedIcon ? (
                            mappedIcon
                          ) : (
                            /* 3) Always works: letter fallback for any new category */
                            <span className="category-letter">{letter}</span>
                          )}
                        </>
                      )}
                    </div>

                    <span>{category.name}</span>
                  </Link>

                  {Array.isArray(category.children) &&
                    category.children.length > 0 && (
                      <div className="subcategories">
                        {category.children.map((sub) => (
                          <Link
                            to={`/category/${sub.id}`}
                            key={sub.id}
                            className="subcategory-item"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
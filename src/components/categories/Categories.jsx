// src/components/Categories.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Categories.css";
import {
  FaMicrochip,
  FaBatteryThreeQuarters,
  FaCogs,
  FaThermometerHalf,
  FaCube,
  FaTools,
  FaBolt,
} from "react-icons/fa";


// 🔹 Replace slug with category IDs (as per your DB)
const categoriesData = [
  { id: 1, name: "DEV BOARDS", icon: <FaMicrochip /> },
  { id: 2, name: "BATTERIES", icon: <FaBatteryThreeQuarters /> },
  { id: 3, name: "COMPONENTS", icon: <FaCogs /> },
  { id: 4, name: "ICS", icon: <FaMicrochip /> },
  { id: 5, name: "SENSORS", icon: <FaThermometerHalf /> },
  { id: 6, name: "MODULES", icon: <FaCube /> },
  { id: 7, name: "TOOLS", icon: <FaTools /> },
  { id: 8, name: "RESISTOR", icon: <FaBolt /> },
  { id: 9, name: "TRANSISTOR", icon: <FaBolt /> },
];



const Categories = () => {
    return (
        <section className="categories-section">
            <div className="container">
                <h2 className="categories-title">Shop by Category</h2>
                <div className="categories-grid">
                    {categoriesData.map((category) => (
                        <Link
                            to={`/category/${category.id}`} 
                            className="category-item"
                            key={category.id}
                        >
                            <div className="category-icon">
                            {category.icon}
                            </div>
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;

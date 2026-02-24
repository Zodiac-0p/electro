// src/pages/About/About.jsx (or src/pages/About.jsx based on your structure)
import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-wrapper">
      <div className="about-container">
        <div className="about-header">
          <h1>About Electroboard</h1>
          <p>Your trusted partner for electronic components and development tools.</p>
        </div>

        <div className="about-card">
          <p>
            At <strong>Electroboard</strong>, we provide high-quality electronic components,
            modules, and development tools to help students, hobbyists, and professionals
            bring their projects to life.
          </p>

          <h3>What we offer</h3>
          <ul>
            <li>Electronic components & modules</li>
            <li>Development boards and DIY kits</li>
            <li>Tools, accessories, and project essentials</li>
            <li>Fast delivery across India</li>
          </ul>

          <h3>Our mission</h3>
          <p>
            To make electronics accessible and affordable by delivering reliable products,
            clear support, and a smooth shopping experience.
          </p>

          <h3>Need help?</h3>
          <p>
            If you have questions about products or orders, please visit our Helpdesk or Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;

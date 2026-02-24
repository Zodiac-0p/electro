import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="policy-wrapper">
      <div className="policy-container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p>Effective Date: January 1, 2025</p>
        </div>

        <div className="policy-card">
          <p>
            At <strong>Electroboards</strong>, we value your privacy and are
            committed to protecting your personal information.
          </p>

          <h3>1. Information We Collect</h3>
          <ul>
            <li>Name, email, phone number</li>
            <li>Shipping and billing address</li>
            <li>Order details</li>
            <li>Technical data (IP, cookies)</li>
          </ul>

          <h3>2. How We Use Information</h3>
          <p>
            We use your information to process orders, provide support, and
            improve our services.
          </p>

          <h3>3. Cookies</h3>
          <p>
            Cookies help us personalize content and analyze traffic. You can
            disable them in your browser.
          </p>

          <h3>4. Security</h3>
          <p>
            We use reasonable security measures to protect your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

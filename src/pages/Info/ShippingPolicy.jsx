import React from "react";
import "./ShippingPolicy.css";

const ShippingPolicy = () => {
  return (
    <div className="policy-wrapper">
      <div className="policy-container">
        <div className="policy-header">
          <h1>Shipping Policy</h1>
          <p>
            We aim to deliver your orders quickly and safely. Please review our
            shipping guidelines below.
          </p>
        </div>

        <div className="policy-card">
          <h3>1. Shipping Times</h3>
          <p>
            <strong>Standard Delivery:</strong> 3–7 business days depending on
            your location.
          </p>
          <p>
            <strong>Express Delivery:</strong> 1–3 business days (where available).
          </p>

          <h3>2. Shipping Costs</h3>
          <p>
            Shipping charges are calculated at checkout based on your delivery
            address. We offer <strong>free shipping</strong> on orders above ₹1500
            for eligible locations.
          </p>

          <h3>3. Order Processing</h3>
          <p>
            Orders are processed within 1–2 business days after payment
            confirmation. You will receive tracking details once your order is dispatched.
          </p>

          <h3>4. Delivery Coverage</h3>
          <p>
            Currently, we ship within India only. For bulk or international
            inquiries, please contact our sales team.
          </p>

          <h3>5. Returns & Damaged Items</h3>
          <p>
            If you receive a damaged, defective, or incorrect item, please
            contact our Helpdesk within 5 days of delivery to initiate a return
            or replacement.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            For shipping-related questions, please reach out through our
            Contact page or Helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

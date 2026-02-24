import React from "react";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  return (
    <div className="policy-wrapper">
      <div className="policy-container">
        <div className="policy-header">
          <h1>Refund Policy</h1>
          <p>Clear, fair refund terms for purchases on our site.</p>
        </div>

        <div className="policy-card">
          <h3>1. Overview</h3>
          <p>
            We accept refund requests for eligible products within 14 days of
            delivery unless otherwise stated.
          </p>

          <h3>2. Eligibility</h3>
          <p>
            To be eligible for a refund, the item must be unused, in the same
            condition that you received it, and in the original packaging.
            Certain items such as perishable goods, custom-made products, and
            downloadable software may not be refundable.
          </p>

          <h3>3. How to Request a Refund</h3>
          <p>
            Contact our Helpdesk with your order number, relevant photos (if
            applicable), and a brief description of the issue. We will evaluate
            the request and respond within 3 business days.
          </p>

          <h3>4. Refund Process</h3>
          <p>
            If approved, refunds will be issued to the original payment method
            within 5–10 business days. Shipping costs are refundable only if the
            return is due to our error or a defective product.
          </p>

          <h3>5. Exchanges</h3>
          <p>
            Exchanges are processed as new orders once the returned item is
            received and inspected. Please contact support to arrange an exchange.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            For refund requests or questions, please visit our Contact page or
            reach out via Helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;

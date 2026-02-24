import React from "react";
import "./TermsOfService.css";

const TermsOfService = () => {
  return (
    <div className="policy-wrapper">
      <div className="policy-container">
        <div className="policy-header">
          <h1>Terms of Service</h1>
          <p>Rules and terms governing use of our website and services.</p>
        </div>

        <div className="policy-card">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using our website, you agree to be bound by these
            Terms of Service. Please read them carefully before placing any order.
          </p>

          <h3>2. User Accounts</h3>
          <p>
            If you create an account, you are responsible for maintaining the
            confidentiality of your login credentials and for all activities
            under your account.
          </p>

          <h3>3. Orders & Pricing</h3>
          <p>
            All orders are subject to product availability and price confirmation.
            We reserve the right to refuse or cancel any order at our discretion.
          </p>

          <h3>4. Intellectual Property</h3>
          <p>
            All content on this website including text, images, logos, and
            trademarks are owned by or licensed to us. Unauthorized use is prohibited.
          </p>

          <h3>5. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, we are not liable for any
            indirect, incidental, or consequential damages arising from use of
            our website or products.
          </p>

          <h3>6. Governing Law</h3>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be
            subject to the jurisdiction of the appropriate courts.
          </p>

          <h3>7. Changes to Terms</h3>
          <p>
            We may update these Terms at any time. Continued use of the website
            after updates constitutes acceptance of the revised Terms.
          </p>

          <h3>8. Contact Us</h3>
          <p>
            For questions regarding these Terms, please contact us through our
            Contact page or Helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

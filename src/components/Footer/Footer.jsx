import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";


const Footer = ({ page = 1, totalPages = 0, onPageChange }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPage = (p) => {
    if (!onPageChange) return;
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ✅ PAGINATION (TOP OF FOOTER) */}
      {totalPages > 1 && (
        <div className="footer-pagination">
          <button
            className="pg-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>

          <span className="pg-text">
            Page {page} of {totalPages}
          </span>

          <button
            className="pg-btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ YOUR EXISTING TOP BAR */}
      <div className="footer-top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-item">
            <i className="fas fa-shipping-fast"></i>
            <span>FAST DELIVERY (3-5 DAYS)</span>
          </div>
          <div className="top-bar-item">
            <i className="fas fa-star"></i>
            <span>LOWEST PRICE</span>
          </div>
          <div className="top-bar-item">
            <i className="fas fa-lock"></i>
            <span>SECURE CHECKOUT</span>
          </div>
          <div className="top-bar-item">
            <i className="fas fa-undo"></i>
            <span>5-DAY FREE RETURNS</span>
          </div>
        </div>
      </div>

      {/* ✅ YOUR ORIGINAL FOOTER */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-section newsletter-section">
            <h4>SUBSCRIBE TO OUR NEWSLETTER</h4>
            <p>
              Enter your email below to receive discount coupons, special offers,
              exclusive discounts and more!.
            </p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email address" required />
              <button type="submit">SUBSCRIBE</button>
            </form>
            <div className="social-icons">
              <a href="https://facebook.com" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://pinterest.com" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
              <a href="https://youtube.com" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="footer-section policies-section">
            <h4>POLICIES</h4>
            <ul>
              <li><Link to="/info/privacy" onClick={handleScrollToTop}>Privacy Policy</Link></li>
              <li><Link to="/info/refund" onClick={handleScrollToTop}>Refund Policy</Link></li>
              <li><Link to="/info/shipping" onClick={handleScrollToTop}>Shipping Policy</Link></li>
              <li><Link to="/info/terms" onClick={handleScrollToTop}>Terms Of Service</Link></li>

            </ul>
          </div>

          <div className="footer-section company-section">
            <h4>COMPANY</h4>
            <ul>
              <li><Link to="/about" onClick={handleScrollToTop}>About Us</Link></li>
              <li><Link to="/contact-us" onClick={handleScrollToTop}>Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-section">
            <h4>CONTACT</h4>
            <p><i className="fas fa-map-marker-alt"></i> KOTTAYAM, KERALA, 686581</p>
            <p><i className="fas fa-phone"></i> Phone: +91 97478 14484</p>
            <p><i className="fas fa-envelope"></i> Email: signalsemitech2010@gmail.com</p>

            <a
              onClick={handleScrollToTop}
              className="scroll-to-top"
              aria-label="Scroll to top"
              style={{ cursor: "pointer" }}
            >
              🔝
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Electroboards. All Rights Reserved.</p>
          <div className="payment-icons">{/* icons */}</div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

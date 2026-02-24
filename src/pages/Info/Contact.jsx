import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>
            We'd love to hear from you. Reach out using the information below or
            send us a message using the helpdesk.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <h3>Customer Support</h3>
            <p>
              <strong>Phone:</strong> +91 97478 14484
            </p>
            <p>
              <strong>Email:</strong> support@electroboards.com
            </p>
            <p>
              <strong>Hours:</strong> Mon–Fri 9:00 — 18:00
            </p>
          </div>

          <div className="contact-card">
            <h3>Head Office</h3>
            <p>Kottayam, Kerala 686581</p>
            <p>India</p>
          </div>
        </div>

        <div className="contact-message">
          <h3>Send us a message</h3>
          <p>
            Please use the Helpdesk page to submit detailed queries or attach
            files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;

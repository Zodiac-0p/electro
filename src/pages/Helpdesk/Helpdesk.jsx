import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Helpdesk.css";
import { submitHelpDeskTicket } from "../../services/api.js";

const Helpdesk = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("support");

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
  });

  const [attachment, setAttachment] = useState(null); // ✅ file state

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState(""); // "submitting" | "success" | "error"

  const faqItems = [
    { id: 1, question: "How long does shipping take?", answer: "We offer fast delivery within 3-5 business days for most locations in India. Express shipping options are available for urgent orders." },
    { id: 2, question: "What is your return policy?", answer: "We offer 5-day free returns on all products. Items must be in original condition with packaging. Return shipping is covered by us." },
    { id: 3, question: "Do you offer bulk discounts?", answer: "Yes, we offer competitive bulk pricing. Please use our 'Request for Quotation' feature or contact our sales team for custom quotes." },
    { id: 4, question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards, UPI, NetBanking, Google Pay, Paytm, and other digital payment methods." },
    { id: 5, question: "How can I track my order?", answer: "Once your order ships, you'll receive a tracking link via email and SMS. You can also track orders from 'Track Order' in the header." },
    { id: 6, question: "Do you offer custom solutions?", answer: "Yes! We provide custom PCB design, assembly, and component sourcing. Contact our team for detailed discussions." },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ handle file selection + validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // ✅ 5MB

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only PDF, JPG, JPEG files are allowed.");
      e.target.value = "";
      setAttachment(null);
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage("File size must be less than 5MB.");
      e.target.value = "";
      setAttachment(null);
      return;
    }

    setErrorMessage("");
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    // show immediate popup
    setShowModal(true);
    setModalStatus("submitting");
    setModalMessage("Submitting ticket...");
    try {
      // ✅ Use FormData to send file
      const payload = new FormData();
      payload.append("subject", formData.subject);
      payload.append("category", formData.category);
      payload.append("priority", formData.priority);
      payload.append("message", formData.message);

      if (attachment) {
        payload.append("attachment", attachment); // ✅ key name: "attachment"
      }

      await submitHelpDeskTicket(payload);

      setSuccessMessage(
        "Support ticket created successfully! We will respond within 24 hours."
      );

      // save for admin review (store minimal page + form info)
      try {
        const saved = JSON.parse(localStorage.getItem("admin_saved_pages") || "[]");
        saved.push({
          id: Date.now(),
          page: "Helpdesk",
          url: window?.location?.pathname || "/helpdesk",
          form: {
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            message: formData.message,
            attachmentName: attachment ? attachment.name : null,
          },
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("admin_saved_pages", JSON.stringify(saved));
      } catch (err) {
        console.error("Failed to save for admin:", err);
      }

      setModalStatus("success");
      setModalMessage(
        "Support ticket created successfully! Saved for admin review."
      );

      setFormData({
        subject: "",
        category: "",
        priority: "",
        message: "",
      });

      setAttachment(null);

      // don't navigate away immediately; allow user to close modal
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Error creating support ticket. Please try again."
      );
      setModalStatus("error");
      setModalMessage(
        error.response?.data?.message || "Error creating support ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="helpdesk-page">
      <div className="container">
        <div className="helpdesk-wrapper">
          <div className="helpdesk-header">
            <h1>Help & Support</h1>
            <p>
              We're here to help! Get answers to your questions or submit a
              support ticket
            </p>
          </div>

          <div className="helpdesk-tabs">
            <button
              className={`tab-button ${activeTab === "support" ? "active" : ""}`}
              onClick={() => setActiveTab("support")}
            >
              Support Ticket
            </button>
            <button
              className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
              onClick={() => setActiveTab("faq")}
            >
              FAQ
            </button>
          </div>

          {activeTab === "support" && (
            <div className="tab-content">
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}
              {errorMessage && (
                <div className="alert alert-error">{errorMessage}</div>
              )}

              {/* ✅ important: enctype handled automatically by FormData */}
              <form className="support-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Briefly describe your issue"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="order_issue">Order Issue</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="payment">Payment Issue</option>
                      <option value="product_quality">Product Quality</option>
                      <option value="return_refund">Return & Refund</option>
                      <option value="technical">Technical Support</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority *</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Describe your issue in detail"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                    />
                  </div>
                </div>

                {/* ✅ File Upload */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="attachment">Attachment (PDF/JPG/JPEG)</label>
                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      accept="application/pdf,image/jpeg,image/jpg"
                      onChange={handleFileChange}
                    />
                    {attachment && (
                      <small className="file-hint">
                        Selected: <b>{attachment.name}</b>
                      </small>
                    )}
                    <small className="file-hint">Max size: 5MB</small>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>
                </div>
              </form>

                {/* Modal popup */}
                {showModal && (
                  <div className="helpdesk-modal-overlay">
                    <div className="helpdesk-modal">
                      <h3>
                        {modalStatus === "submitting"
                          ? "Submitting..."
                          : modalStatus === "success"
                          ? "Submitted"
                          : "Error"}
                      </h3>
                      <p>{modalMessage}</p>
                      <div className="modal-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              {/* your existing support-info stays same */}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="tab-content">
              <div className="faq-container">
                {faqItems.map((item) => (
                  <div key={item.id} className="faq-item">
                    <div
                      className="faq-question"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      <span>{item.question}</span>
                      <i
                        className={`fas fa-chevron-${
                          expandedFAQ === item.id ? "up" : "down"
                        }`}
                      ></i>
                    </div>

                    {expandedFAQ === item.id && (
                      <div className="faq-answer">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="faq-footer">
                <p>Couldn't find what you're looking for?</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("support")}
                >
                  Submit a Support Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;

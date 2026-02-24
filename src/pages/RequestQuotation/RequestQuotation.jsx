import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestQuotation.css";
import { submitQuotation } from "../../services/api.js";

const RequestQuotation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    productDetails: "",
    quantity: "",
    specifications: "",
    deliveryLocation: "",
    timeline: "",
    businessName: "",
    businessType: "",
    budget: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // ✅ convert to backend field names
    const payload = {
      product_details: formData.productDetails,
      quantity: Number(formData.quantity),
      specifications: formData.specifications || "",
      delivery_location: formData.deliveryLocation,
      timeline: formData.timeline,
      business_name: formData.businessName,
      business_type: formData.businessType,
      budget: formData.budget || "",
    };

    try {
      await submitQuotation(payload);

      setSuccessMessage(
        "Quotation request submitted successfully! We will contact you soon."
      );

      setFormData({
        productDetails: "",
        quantity: "",
        specifications: "",
        deliveryLocation: "",
        timeline: "",
        businessName: "",
        businessType: "",
        budget: "",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.log("Quotation error:", error.response?.data || error.message);

      // show real backend error if available
      setErrorMessage(
        JSON.stringify(error.response?.data) ||
          "Error submitting quotation request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-quotation-page">
      <div className="container">
        <div className="quotation-wrapper">
          <div className="quotation-header">
            <h1>Request a Quotation</h1>
            <p>Get a customized quote for your bulk orders or special requirements</p>
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

          <form className="quotation-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productDetails">Product Details *</label>
                <textarea
                  id="productDetails"
                  name="productDetails"
                  placeholder="Describe the products you're interested in"
                  value={formData.productDetails}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity Needed *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specifications">Specifications or Custom Requirements</label>
                <textarea
                  id="specifications"
                  name="specifications"
                  placeholder="Any specific requirements or customizations needed?"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deliveryLocation">Delivery Location *</label>
                <input
                  type="text"
                  id="deliveryLocation"
                  name="deliveryLocation"
                  placeholder="Enter delivery city/location"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeline">Required Timeline *</label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Timeline</option>
                  <option value="urgent">Urgent (1-7 days)</option>
                  <option value="normal">Normal (1-2 weeks)</option>
                  <option value="flexible">Flexible (3+ weeks)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessName">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget Range</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  placeholder="e.g., ₹5000 - ₹10000"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Quotation Request"}
              </button>

              <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                Cancel
              </button>
            </div>
          </form>

          <div className="quotation-info">
            <h3>What happens next?</h3>
            <ul>
              <li>Our sales team will review your quotation request</li>
              <li>We'll contact you within 24 hours with a detailed quote</li>
              <li>You can negotiate terms and customize your order</li>
              <li>Finalize your order and proceed with payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuotation;

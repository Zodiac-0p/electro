import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

const VerifyPhone = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const phoneFromQuery = params.get("phone") || "";

  const [phone, setPhone] = useState(phoneFromQuery);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(1); // 1=send otp, 2=verify otp
  const [loading, setLoading] = useState(false);

  // Auto-send OTP if phone comes via query
  useEffect(() => {
    if (phoneFromQuery) handleSendOtp();
    // eslint-disable-next-line
  }, []);

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setStatus("❌ Enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      await apiFetch("/user/phone/send-otp/", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone.trim() }),
      });

      setStep(2);
      setStatus("✅ OTP sent to your phone.");
    } catch (err) {
      setStatus("❌ Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 4) {
      setStatus("❌ Enter a valid 4-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      await apiFetch("/user/phone/verify-otp/", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim() }),
      });

      setStatus("✅ Phone verified successfully!");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      setStatus("❌ Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Verify Your Phone</h2>
      <p>We will send an OTP to verify your phone number.</p>

      {/* Phone input */}
      <div style={{ marginTop: "20px" }}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          style={{ padding: "10px", width: "260px" }}
          disabled={step === 2}
        />
      </div>

      {/* Step buttons */}
      {step === 1 && (
        <button
          onClick={handleSendOtp}
          style={{ padding: "10px 20px", marginTop: "20px" }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      )}

      {step === 2 && (
        <>
          <div style={{ marginTop: "20px" }}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit OTP"
              maxLength={4}
              style={{ padding: "10px", width: "260px" }}
            />
          </div>

          <button
            onClick={handleVerifyOtp}
            style={{ padding: "10px 20px", marginTop: "20px" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div style={{ marginTop: "12px" }}>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{ padding: "8px 16px" }}
            >
              Resend OTP
            </button>
          </div>
        </>
      )}

      {status && <p style={{ marginTop: "20px" }}>{status}</p>}
    </div>
  );
};

export default VerifyPhone;
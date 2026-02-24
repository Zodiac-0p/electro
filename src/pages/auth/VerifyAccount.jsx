import { useParams } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../../services/api";

const VerifyAccount = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("");

  const handleVerify = async () => {
    try {
      const res = await apiFetch(`/user/verify/${uid}/${token}/`);
;
      setStatus("✅ Email verified successfully! You can now login.");
    } catch (err) {
      setStatus("❌ Verification failed or expired.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Verify Your Account</h2>
      <p>Click below to verify your email address.</p>

      <button onClick={handleVerify} style={{ padding: "10px 20px" }}>
        Verify Account
      </button>

      {status && <p style={{ marginTop: "20px" }}>{status}</p>}
    </div>
  );
};

export default VerifyAccount;

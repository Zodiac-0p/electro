import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import "./profile.css";

const maskEmail = (email) => {
  const [user, domain] = (email || "").split("@");
  if (!user || !domain) return email || "-";
  if (user.length <= 2) return "*@" + domain;
  return user[0] + "*".repeat(user.length - 2) + user.slice(-1) + "@" + domain;
};

const maskPhone = (phone) => {
  if (!phone) return "-";
  if (phone.length <= 4) return "*".repeat(phone.length);
  return phone.slice(0, 2) + "*".repeat(phone.length - 4) + phone.slice(-2);
};

const Profile = () => {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ OTP states (inside component)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await apiFetch("/user/me/", "GET", null, true);

        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
        });

        // Reset otp ui when loading profile
        setOtp("");
        setOtpSent(false);
        setStatus("");
      } catch (e) {
        setError("Failed to load profile");
      }
    };

    getUser();
  }, []);

  const handleSendOtp = async () => {
    const phone = (formData.phone_number || "").trim();

    if (!phone || phone.length < 10) {
      setStatus("❌ Enter valid phone number");
      return;
    }

    try {
      setStatus("");
      await apiFetch("/user/phone/send-otp/", "POST", { phone_number: phone }, true);

      setOtpSent(true);
      setStatus("✅ OTP sent to your phone");
    } catch (err) {
      setStatus("❌ Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const phone = (formData.phone_number || "").trim();
    const code = (otp || "").trim();

    // ✅ you are using 4-digit OTP
    if (code.length !== 4) {
      setStatus("❌ Enter valid 4-digit OTP");
      return;
    }

    try {
      setStatus("");
      const updatedUser = await apiFetch(
        "/user/phone/verify-otp/",
        "POST",
        { phone_number: phone, otp: code },
        true
      );

      // ✅ If backend returns updated user, use it. Else force verified in state.
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser((prev) => ({ ...prev, is_verified: true }));
      }

      setStatus("✅ Phone verified successfully");

      // ✅ hide OTP UI after verified
      setOtpSent(false);
      setOtp("");
    } catch (err) {
      setStatus("❌ Invalid or expired OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await apiFetch("/user/me/", "PUT", formData, true);

      setUser(updated);
      localStorage.setItem("username", updated.username);

      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">Profile updated successfully!</div>}

        {/* ✅ OTP status message */}
        {status && <p style={{ marginTop: "10px" }}>{status}</p>}

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-row">
              <span>Username</span>
              <strong>{user.username}</strong>
            </div>

            <div className="profile-row">
              <span>Email</span>
              <strong>{maskEmail(user.email)}</strong>
            </div>

            <div className="profile-row">
              <span>Phone</span>
              <strong>{maskPhone(user.phone_number)}</strong>
            </div>

            <div className="profile-row">
              <span>Verified</span>
              <strong className={user.is_verified ? "verified" : "not-verified"}>
                {user.is_verified ? "Yes" : "No"}
              </strong>
            </div>

            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  value={formData.phone_number}
                  onChange={(e) => {
                    setFormData({ ...formData, phone_number: e.target.value });
                    // reset otp UI when phone changes
                    setOtp("");
                    setOtpSent(false);
                    setStatus("");
                  }}
                  placeholder="Enter phone number"
                />

                {/* ✅ after verified, do NOT show Verify button */}
                {user?.is_verified ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>✅ Verified</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{ padding: "6px 12px" }}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>

            {/* ✅ show OTP input only if otp sent AND not verified */}
            {otpSent && !user?.is_verified && (
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label>Enter OTP</label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                    placeholder="4-digit OTP"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    style={{ padding: "6px 12px" }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            <div className="profile-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  setOtp("");
                  setOtpSent(false);
                  setStatus("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
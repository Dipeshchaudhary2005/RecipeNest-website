import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

export default function ProfileUpdateModal({ isOpen, onClose, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Update text fields
      const profileResponse = await userAPI.updateProfile(formData);
      
      // 2. Update avatar if a new one was selected
      let updatedUser = profileResponse.data.data.user;
      
      if (avatar) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatar);
        const avatarResponse = await userAPI.updateAvatar(avatarFormData);
        updatedUser = avatarResponse.data.data.user;
      }

      setSuccess(true);
      if (onUpdate) onUpdate(updatedUser);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
      backdropFilter: "blur(8px)",
      padding: "20px"
    }}>
      <div className="modal-content" style={{
        background: "var(--white)",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "500px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        animation: "modalFadeUp 0.4s ease-out"
      }}>
        {/* Header */}
        <div style={{
          padding: "32px 32px 24px",
          borderBottom: "1px solid var(--border-light)",
          background: "linear-gradient(135deg, var(--white) 0%, var(--bg) 100%)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--navy)", marginBottom: "4px" }}>Edit Profile</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Update your personal information and profile picture.</p>
            </div>
            <button 
              onClick={onClose}
              style={{ background: "var(--white)", border: "none", width: "36px", height: "36px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          {error && (
            <div style={{ padding: "14px", background: "#fef2f2", color: "#dc2626", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fee2e2" }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "14px", background: "#f0fdf4", color: "#16a34a", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", border: "1px solid #dcfce7", textAlign: "center" }}>
              ✨ Profile updated successfully!
            </div>
          )}

          {/* Avatar Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div 
              onClick={() => document.getElementById("avatar-upload").click()}
              style={{ 
                width: "100px", 
                height: "100px", 
                borderRadius: "32px", 
                background: avatarPreview ? `url(${avatarPreview}) center/cover` : "var(--primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                border: "4px solid var(--white)"
              }}
            >
              {!avatarPreview && <span style={{ color: "white", fontSize: "32px", fontWeight: "700" }}>{user?.name?.[0].toUpperCase()}</span>}
              <div style={{ 
                position: "absolute", 
                bottom: "-5px", 
                right: "-5px", 
                background: "var(--navy)", 
                width: "32px", 
                height: "32px", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                border: "2px solid var(--white)"
              }}>
                📸
              </div>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Click to change photo</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px", transition: "all 0.2s" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Address</label>
              <textarea 
                name="address" 
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street name, City, Zip"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px", resize: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              style={{ flex: 1, padding: "14px", borderRadius: "14px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2, padding: "14px", borderRadius: "14px" }}
              disabled={loading}
            >
              {loading ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

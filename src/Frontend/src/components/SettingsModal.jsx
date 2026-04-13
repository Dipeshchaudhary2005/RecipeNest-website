import { useState } from "react";

export default function SettingsModal({ isOpen, onClose, user }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: localStorage.getItem("theme") === "dark",
    privateAccount: false,
    autoPlay: true
  });

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSettings(prev => {
      const newVal = !prev[key];
      if (key === "darkMode") {
        const theme = newVal ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }
      return { ...prev, [key]: newVal };
    });
  };

  const sections = [
    {
      title: "Notifications",
      items: [
        { id: "emailNotifications", label: "Email Notifications", desc: "Receive recipe updates via email" },
        { id: "pushNotifications", label: "Push Notifications", desc: "Get instant alerts on your device" }
      ]
    },
    {
      title: "Appearance & Privacy",
      items: [
        { id: "darkMode", label: "Dark Mode", desc: "Switch to a darker color palette" },
        { id: "privateAccount", label: "Private Account", desc: "Only followers can see your saved recipes" }
      ]
    },
    {
      title: "Content",
      items: [
        { id: "autoPlay", label: "Auto-play Videos", desc: "Automatically play recipe previews" }
      ]
    }
  ];

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      backdropFilter: "blur(8px)",
      padding: "20px"
    }}>
      <div className="modal-content" style={{
        background: "var(--white)",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-light)"
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "var(--white)",
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--navy)" }}>Settings</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Manage your account and preferences</p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: "var(--bg)", 
              border: "none", 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--text-muted)"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "16px 32px 32px" }}>
          {sections.map((section, sIdx) => (
            <div key={section.title} style={{ marginTop: sIdx === 0 ? "8px" : "32px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {section.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {section.items.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, paddingRight: "20px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)", marginBottom: "2px" }}>{item.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>{item.desc}</div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings[item.id]} 
                        onChange={() => handleToggle(item.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "14px" }}
              onClick={onClose}
            >
              Save Changes
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
              Version 1.0.4 • Signed in as {user?.email || "user"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

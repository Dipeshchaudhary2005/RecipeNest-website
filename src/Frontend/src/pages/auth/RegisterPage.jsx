import { useState } from "react";
import { authAPI } from "../../services/api";

export default function RegisterPage({ setPage, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !pass) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register({
        name,
        email,
        password: pass,
        role
      });

      if (response.data.success) {
        setPage("login");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Registration failed. This account may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Visual Side */}
        <div className="auth-visual">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=1200&fit=crop" alt="Chef Cooking" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-text">
            <h2 className="serif">Share your <br /> culinary journey.</h2>
            <p>Whether you're a professional chef or a home cook, we have a place for your recipes.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-panel">
          {/* Back/Close Button */}
          <button 
            onClick={() => setPage("home")} 
            className="btn-back"
            style={{ 
              position: "absolute", 
              top: "24px", 
              right: "24px", 
              background: "var(--bg)", 
              border: "1px solid var(--border-light)", 
              padding: "8px", 
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "var(--text-muted)",
              transition: "var(--transition)"
            }}
            onMouseEnter={(e) => e.target.style.transform = "rotate(90deg)"}
            onMouseLeave={(e) => e.target.style.transform = "rotate(0deg)"}
          >
            ✕
          </button>

          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff" }}>🍽</div>
            <span className="serif" style={{ fontSize: "16px", fontWeight: "800", color: "var(--navy)" }}>RecipeNest</span>
          </div>

          <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>Create account</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Join our community of food enthusiasts today.</p>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          <div className="field-wrap" style={{ marginBottom: "16px" }}>
            <label className="field-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <span className="field-icon">👤</span>
              <input
                className="field-input"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field-wrap" style={{ marginBottom: "16px" }}>
            <label className="field-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <span className="field-icon">✉</span>
              <input
                className="field-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field-wrap" style={{ marginBottom: "20px" }}>
            <label className="field-label">Password</label>
            <div style={{ position: "relative" }}>
              <span className="field-icon">🔒</span>
              <input
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="field-label">I am a...</label>
            <div style={{ display: "flex", gap: "12px" }}>
              {["user", "chef"].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1.5px solid",
                    borderColor: role === r ? "var(--primary)" : "var(--border-light)",
                    background: role === r ? "var(--white)" : "var(--bg)",
                    color: role === r ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: "700",
                    fontSize: "13px",
                    textTransform: "capitalize",
                    cursor: "pointer",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => {
                    if (role !== r) e.target.style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    if (role !== r) e.target.style.borderColor = "var(--border-light)";
                  }}
                >
                  {r === "user" ? "User" : "Chef"}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleRegister}
            disabled={loading}
            style={{ padding: "14px", fontSize: "15px", marginBottom: "24px", width: "100%" }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="auth-footer" style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account? <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", marginLeft: "4px" }}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

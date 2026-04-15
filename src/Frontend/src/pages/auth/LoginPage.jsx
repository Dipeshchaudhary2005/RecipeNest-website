import { useState } from "react";
import { authAPI } from "../../services/api";

export default function LoginPage({ setPage, setUser, onBack }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login({
        email,
        password: pass
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Permanent Storage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // App State
        setUser(user);
        
        // Role-based redirect
        setPage(`${user.role}-dashboard`);
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("invalid")) {
        setError(`${msg} (Try signing up if you haven't yet!)`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Visual Side */}
        <div className="auth-visual">
          <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=1200&fit=crop" alt="Delicious Food" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-text">
            <h2 className="serif">Discover the art <br /> of home cooking.</h2>
            <p>Join thousands of food enthusiasts sharing their secret family recipes every day.</p>
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

          <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff" }}>🍽</div>
            <span className="serif" style={{ fontSize: "16px", fontWeight: "800", color: "var(--navy)" }}>RecipeNest</span>
          </div>

          <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px" }}>Sign in to continue your culinary journey.</p>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          <div className="field-wrap">
            <label className="field-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <span className="field-icon">✉</span>
              <input
                className="field-input"
                type="text"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="field-label" style={{ margin: 0 }}>Password</label>
              <button className="btn-ghost" onClick={() => setPage("forgot-password")} style={{ fontSize: "12px", border: "none", background: "none", color: "var(--primary)", fontWeight: "600" }}>Forgot?</button>
            </div>
            <div style={{ position: "relative" }}>
              <span className="field-icon">🔒</span>
              <input
                className="field-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                disabled={loading}
              />
              <button className="field-eye" onClick={() => setShowPass(v => !v)} disabled={loading}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ padding: "14px", fontSize: "15px", marginBottom: "24px", width: "100%" }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="auth-footer" style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            Don't have an account? <button onClick={() => setPage("signup")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", marginLeft: "4px" }}>Sign up</button>
          </div>
        </div>
      </div>
    </div>
  );
}

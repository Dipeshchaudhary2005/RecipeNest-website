import { useState } from "react";
import { authAPI } from "../../services/api";

export default function RegisterPage({ setPage, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("user");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // "form" or "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!name || !email || !pass || !phone) {
      setError("Please fill in all fields");
      return;
    }

    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.sendSignupOTP(email);
      if (response.data.success) {
        setStep("otp");
      }
    } catch (err) {
      console.error("OTP error:", err);
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Verify OTP
      await authAPI.verifySignupOTP({ email, code: otp });

      // 2. Register User
      const response = await authAPI.register({
        name,
        email,
        phone,
        password: pass,
        role
      });

      if (response.data.success) {
        setPage("login");
      }
    } catch (err) {
      console.error("Verification/Register error:", err);
      setError(err.response?.data?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
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

          <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>
            {step === "form" ? "Create account" : "Verify Email"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
            {step === "form" ? "Join our community of food enthusiasts today." : `We've sent a 6-digit code to ${email}`}
          </p>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          {step === "form" ? (
            <>
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

              <div className="field-wrap" style={{ marginBottom: "16px" }}>
                <label className="field-label">Phone Number (10 digits)</label>
                <div style={{ position: "relative" }}>
                  <span className="field-icon">📱</span>
                  <input
                    className="field-input"
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    disabled={loading}
                    maxLength="10"
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
                    >
                      {r === "user" ? "User" : "Chef"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSendOTP}
                disabled={loading}
                style={{ padding: "14px", fontSize: "15px", marginBottom: "24px", width: "100%" }}
              >
                {loading ? "Sending Code..." : "Next: Verify Email"}
              </button>
            </>
          ) : (
            <>
              <div className="field-wrap" style={{ marginBottom: "24px" }}>
                <label className="field-label">Verification Code</label>
                <div style={{ position: "relative" }}>
                  <span className="field-icon">🔑</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={loading}
                    maxLength="6"
                    style={{ letterSpacing: otp ? "8px" : "normal", fontSize: otp ? "20px" : "15px", textAlign: otp ? "center" : "left" }}
                  />
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleVerifyAndRegister}
                disabled={loading}
                style={{ padding: "14px", fontSize: "15px", marginBottom: "16px", width: "100%" }}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <button
                onClick={() => setStep("form")}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "13px", width: "100%", cursor: "pointer" }}
                disabled={loading}
              >
                ← Edit registration details
              </button>
            </>
          )}

          <div className="auth-footer" style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)", marginTop: "24px" }}>
            Already have an account? <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", marginLeft: "4px" }}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

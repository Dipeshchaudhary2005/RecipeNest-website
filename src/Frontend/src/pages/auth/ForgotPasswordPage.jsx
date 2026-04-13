import { useState } from "react";
import { authAPI } from "../../services/api";

export default function ForgotPasswordPage({ setPage }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset, 4=success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };

  const sendResetCode = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setMessage(response.data.message || "Reset code sent.");
        setStep(2);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Unable to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    const code = otp.join("");
    if (!email || !code || code.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.verifyResetCode({ email, code });
      if (response.data.success) {
        setMessage(response.data.message || "Code verified.");
        setStep(3);
      }
    } catch (err) {
      console.error("Verify reset code error:", err);
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPass || !confirmPass) {
      setError("Please fill in both password fields");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }
    if (newPass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const code = otp.join("");
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.resetPassword({ email, code, password: newPass });
      if (response.data.success) {
        setMessage(response.data.message || "Password reset successfully.");
        setStep(4);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const stepImages = [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&h=1000&fit=crop",
  ];

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Visual Side */}
        <div className="auth-visual">
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=1200&fit=crop" alt="Reset Password" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-text">
            <h2 className="serif">Reset your <br /> password.</h2>
            <p>We'll help you get back to your kitchen in just a few steps.</p>
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

          {/* STEP 1 — Email */}
          {step === 1 && (<>
            <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>Forgot password?</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Enter your email address and we'll send you a recovery code.</p>

            {message && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {error}
              </div>
            )}
            
            <div className="field-wrap">
              <label className="field-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <span className="field-icon">✉</span>
                <input className="field-input" type="email" placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={sendResetCode} disabled={loading}>{loading ? "Sending code..." : "Send Reset Code"}</button>
          </>)}

          {/* STEP 2 — OTP */}
          {step === 2 && (<>
            <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>Verify email</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px" }}>We've sent a 6-digit code to <strong style={{color:"var(--navy)"}}>{email}</strong></p>
            
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom: "32px" }}>
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`}
                  style={{ width:42, height:48, textAlign:"center", fontSize:18, fontWeight:700, border:"1.5px solid var(--border-light)", background:"var(--bg)", color:"var(--text-main)", borderRadius:10, outline:"none", transition:"border-color .2s" }}
                  maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "var(--border-light)"}
                />
              ))}
            </div>

            {message && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {error}
              </div>
            )}
            
            <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={verifyCode} disabled={loading}>{loading ? "Verifying..." : "Verify Code"}</button>
            <p style={{textAlign:"center", fontSize:13, color:"var(--text-muted)", marginTop:20}}>
              Didn't receive it? <button style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: "600" }} onClick={sendResetCode} disabled={loading}>Resend</button>
            </p>
          </>)}

          {/* STEP 3 — New Password */}
          {step === 3 && (<>
            <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>New password</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Choose a strong password for your account.</p>

            {message && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {error}
              </div>
            )}
            
            <div className="field-wrap">
              <label className="field-label">New Password</label>
              <div style={{ position: "relative" }}>
                <span className="field-icon">🔒</span>
                <input className="field-input" type={showNew ? "text" : "password"} placeholder="••••••••"
                  value={newPass} onChange={e => setNewPass(e.target.value)} disabled={loading} />
                <button className="field-eye" onClick={() => setShowNew(v => !v)}>{showNew ? "🙈" : "👁"}</button>
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <span className="field-icon">🔒</span>
                <input className="field-input" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                  value={confirmPass} onChange={e => setConfirmPass(e.target.value)} disabled={loading} />
                <button className="field-eye" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? "🙈" : "👁"}</button>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={resetPassword} disabled={loading}>{loading ? "Resetting..." : "Update Password"}</button>
          </>)}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16, 185, 129, 0.1)", color:"#10b981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 24px" }}>
                <i className="ri-checkbox-circle-line"></i>
              </div>
              <h1 className="serif" style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>Success!</h1>
              <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:32, lineHeight:1.6 }}>
                Your password has been reset. You can now sign in with your new credentials.
              </p>
              <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={() => setPage("login")}>Back to Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

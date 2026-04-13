import { useEffect } from "react";

export default function AuthCallbackPage({ setPage, setUser }) {
  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userParam = urlParams.get("user");
      const error = urlParams.get("error");

      if (error) {
        console.error("Auth error:", error);
        setPage("login");
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Store in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Update app state
          setUser(user);
          
          // Redirect to dashboard
          setPage(`${user.role}-dashboard`);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("Error parsing auth callback:", err);
          setPage("login");
        }
      } else {
        setPage("login");
      }
    };

    handleCallback();
  }, [setPage, setUser]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      background: "var(--bg)",
      padding: "20px"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          border: "4px solid var(--border-light)", 
          borderTop: "4px solid var(--primary)", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }} />
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--text-main)", marginBottom: "8px" }}>
          Signing you in...
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Please wait while we complete your authentication.
        </p>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
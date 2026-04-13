export default function Navbar({ setPage, user, onLogout, onBack, showBack, search, setSearch, theme, toggleTheme }) {
  return (
    <nav className="top-nav" style={{ 
      background: "var(--white)", 
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-light)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "0 60px", 
      height: "72px", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000,
      transition: "var(--transition)"
    }}>
      {/* Left: Logo & Back */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", minWidth: "150px" }}>
        {showBack && (
          <button 
            className="btn-back" 
            onClick={onBack} 
            style={{ 
              padding: "8px", 
              borderRadius: "10px", 
              background: "var(--bg)", 
              border: "1px solid var(--border-light)" 
            }}
          >
            <span style={{ fontSize: "16px", color: "var(--text-main)" }}>←</span>
          </button>
        )}
        <button 
          className="top-nav-logo" 
          onClick={() => setPage("home")}
          style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "10px", color: "var(--navy)", fontSize: "22px", fontWeight: "800", fontFamily: "'Playfair Display', serif" }}
        >
          <div style={{ width: "32px", height: "32px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", fontWeight: "900" }}>R</div>
          RecipeNest
        </button>
      </div>

      {/* Center Group: Links & Search */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "40px" }}>
        <div className="top-nav-links" style={{ display: "flex", gap: "28px" }}>
          {["Explore Recipes", "About", "Contact", "Community"].map(link => (
            <button 
              key={link}
              className="top-nav-link" 
              onClick={() => {
                if (link === "Explore Recipes") {
                  setPage("explore-recipes");
                } else {
                  setPage("home");
                }
              }} 
              style={{ 
                background: "none", 
                border: "none", 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "var(--text-muted)",
                padding: "8px 0",
                transition: "color 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
            >
              {link}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: "340px", position: "relative" }}>
          <div style={{ 
            background: "var(--bg)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            padding: "4px 4px 4px 16px",
            border: "1px solid var(--border-light)",
            transition: "all 0.3s"
          }}>
            <input 
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage("home");
              }}
              style={{ 
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "14px",
                width: "100%",
                color: "var(--text-main)"
              }}
            />
            <button 
              className="btn-primary"
              style={{ 
                width: "36px",
                height: "36px",
                borderRadius: "10px", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "8px",
                padding: 0
              }}>
              <i className="ri-search-line" style={{ fontSize: "18px" }}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "150px", justifyContent: "flex-end" }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            border: "1px solid var(--border-light)",
            background: "var(--bg)",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            cursor: "pointer",
            transition: "var(--transition)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <i className={theme === "light" ? "ri-moon-line" : "ri-sun-line"}></i>
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => setPage(`${user.role}-dashboard`)}
              style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", background: "none", border: "none" }}
            >
              {`${user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"} Dashboard`}
            </button>
            <button 
              onClick={onLogout}
              style={{ 
                background: "var(--bg)", 
                border: "1px solid var(--border-light)",
                padding: "8px 16px", 
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-main)",
                transition: "var(--transition)"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,49,49,0.05)"}
              onMouseLeave={(e) => e.target.style.background = "var(--bg)"}
            >
              Log out
            </button>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            style={{ padding: "10px 24px", fontSize: "14px" }} 
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}

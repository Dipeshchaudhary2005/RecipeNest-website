import { useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export default function HomePage({ setPage, setSelectedRecipe, search, setSearch }) {

  useEffect(() => {
    fetchRecipes();

    const onRecipeCreated = (event) => {
      // Recipe created logic removed as recipes state is unused
    };

    window.addEventListener("recipe-created", onRecipeCreated);

    return () => {
      window.removeEventListener("recipe-created", onRecipeCreated);
    };
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes`);
      if (response.data.success) {
        // Recipes set removed as requested by cleanup
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  // FEATURED_SAMPLES removed as unused

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero Section */}
      <section style={{ 
        background: "linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 100%)", 
        textAlign: "center", 
        padding: "100px 24px 140px", 
        position: "relative", 
        overflow: "hidden" 
      }}>
        {/* Decorative background element */}
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 49, 49, 0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ 
            fontSize: "clamp(40px, 6vw, 64px)", 
            fontWeight: 900, 
            color: "#fff", 
            lineHeight: 1.1, 
            marginBottom: "20px",
            letterSpacing: "-1px"
          }}>
            Best recipes <br /> for your taste
          </h1>
          <p style={{ 
            color: "rgba(255, 255, 255, 0.6)", 
            fontSize: "16px", 
            maxWidth: "500px", 
            margin: "0 auto 40px", 
            lineHeight: 1.6, 
            fontWeight: 400 
          }}>
            Discover delicious recipes from talented chefs around the world. Cook with confidence and create amazing meals.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => setPage("signup")}>Get Started</button>
            <button 
              className="btn-secondary" 
              style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                color: "#fff", 
                borderColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(4px)"
              }} 
              onClick={() => setPage("login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 100px" }}>
        
        {/* Engagement Stats Section */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "24px", 
          marginBottom: "80px" 
        }}>
          {[
            { label: "Elite Chefs", value: "850+", icon: "👨‍🍳", sub: "Verified professionals" },
            { label: "Global Recipes", value: "12k+", icon: "📜", sub: "Across 24 cuisines" },
            { label: "Active Foodies", value: "50k+", icon: "👥", sub: "Sharing every day" }
          ].map(stat => (
            <div key={stat.label} className="card-hover" style={{ 
              background: "var(--white)", 
              padding: "32px", 
              borderRadius: "var(--radius-lg)", 
              border: "1px solid var(--border-light)",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--navy)", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{stat.label}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

      </main>

      {/* Premium Footer */}
      <footer style={{ background: "var(--navy-deep)", padding: "100px 40px 40px", color: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "60px", marginBottom: "80px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "32px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍽</div>
                <span className="serif" style={{ fontSize: "24px", fontWeight: "700" }}>RecipeNest</span>
              </div>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: "1.7", maxWidth: "300px" }}>
                Connecting food lovers with exceptional recipes from the world's most talented chefs. Join our community today.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Explore", "Categories", "Trending", "Featured"] },
              { title: "Company", links: ["About Us", "Careers", "Contact", "Blog"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px", color: "rgba(255,255,255,0.9)" }}>{col.title}</h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map(link => (
                    <li key={link} style={{ marginBottom: "12px" }}>
                      <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "14px", padding: 0 }}>{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            borderTop: "1px solid rgba(255,255,255,0.1)", 
            paddingTop: "40px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)"
          }}>
            <p>© 2024 RecipeNest Inc. All rights reserved.</p>
            <div style={{ display: "flex", gap: "20px" }}>
              <span>Instagram</span>
              <span>Twitter</span>
              <span>Facebook</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

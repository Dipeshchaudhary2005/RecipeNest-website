import { useState, useEffect } from "react";
import { recipeAPI } from "../services/api";
import RecipeCard from "../components/RecipeCard";

export default function HomePage({ setPage, setSelectedRecipe, search, setSearch, user }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();

    const onRecipeCreated = (event) => {
      const newRecipe = event.detail;
      setRecipes(prev => [newRecipe, ...prev]);
    };

    window.addEventListener("recipe-created", onRecipeCreated);
    return () => window.removeEventListener("recipe-created", onRecipeCreated);
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll({ limit: 6 });
      if (response.data.success) {
        const data = response.data.data;
        setRecipes(Array.isArray(data) ? data : data.recipes || []);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      setPage("login");
      return;
    }

    // Redirect logged-in users to their dashboard
    switch (user.role) {
      case "admin": setPage("admin-dashboard"); break;
      case "chef": setPage("chef-dashboard"); break;
      case "user": setPage("user-dashboard"); break;
      default: setPage("explore-recipes");
    }
  };

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
            <button className="btn-primary" onClick={handleGetStarted}>Get Started</button>
            <button 
              className="btn-secondary" 
              style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                color: "#fff", 
                borderColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(4px)"
              }} 
              onClick={() => setPage("explore-recipes")}
            >
              Explore Recipes
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 100px" }}>
        
        {/* Engagement Stats Section */}
        <div id="community-stats" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "24px", 
          marginBottom: "80px",
          marginTop: "-80px",
          position: "relative",
          zIndex: 2
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
              boxShadow: "var(--shadow-md)"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--navy)", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{stat.label}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Latest Recipes Grid */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <h2 className="serif" style={{ fontSize: "36px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>Latest Recipes</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Freshly published dishes from our global community.</p>
            </div>
            <button 
              onClick={() => setPage("explore-recipes")}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              See All Recipes <span style={{ fontSize: "20px" }}>→</span>
            </button>
          </div>

          {loading ? (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "32px" }}>
               {[1,2,3].map(i => (
                 <div key={i} style={{ height: "400px", background: "var(--border-light)", borderRadius: "24px", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
               ))}
             </div>
          ) : recipes.length > 0 ? (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: "32px" 
            }}>
              {recipes.map(recipe => (
                <RecipeCard 
                  key={recipe._id} 
                  recipe={recipe} 
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setPage("recipe-detail");
                  }} 
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>No recipes found yet. Check back soon!</p>
            </div>
          )}
        </div>

      </main>

      {/* Premium Footer */}
      <footer id="footer-contact" style={{ background: "var(--navy-deep)", padding: "100px 40px 40px", color: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "60px", marginBottom: "80px" }}>
            <div id="about-section" style={{ gridColumn: "span 2" }}>
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
                      <button 
                        onClick={() => {
                          if (link === "Explore" || link === "Categories") setPage("explore-recipes");
                          if (link === "About Us") document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
                          if (link === "Contact") document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "14px", padding: 0, cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.target.style.color = "#fff"}
                        onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
                      >
                        {link}
                      </button>
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

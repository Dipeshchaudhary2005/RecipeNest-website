import { useState, useEffect, useCallback } from "react";
import { recipeAPI } from "../services/api";
import RecipeCard from "../components/RecipeCard";

export default function ExploreRecipesPage({ setPage, setSelectedRecipe, setSelectedChefId, user, setUser }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const TABS = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    fetchRecipes();

    const onRecipeCreated = (event) => {
      const newRecipe = event.detail;
      if (newRecipe.status === "Live") {
        setRecipes(prev => [newRecipe, ...prev]);
      }
    };

    const onRecipeUpdated = (event) => {
      const updatedRecipe = event.detail;
      setRecipes(prev => {
        const exists = prev.some(r => r._id === updatedRecipe._id);
        if (exists) {
          if (updatedRecipe.status !== "Live") {
            return prev.filter(r => r._id !== updatedRecipe._id);
          }
          return prev.map(r => r._id === updatedRecipe._id ? updatedRecipe : r);
        } else if (updatedRecipe.status === "Live") {
          return [updatedRecipe, ...prev];
        }
        return prev;
      });
    };

    window.addEventListener("recipe-created", onRecipeCreated);
    window.addEventListener("recipe-updated", onRecipeUpdated);
    return () => {
      window.removeEventListener("recipe-created", onRecipeCreated);
      window.removeEventListener("recipe-updated", onRecipeUpdated);
    };
  }, [fetchRecipes]);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      if (response.data.success) {
        const data = response.data.data;
        setRecipes(Array.isArray(data) ? data : data.recipes || []);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         (r.chef?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || r.difficulty === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "120px 60px 60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "60px", textAlign: "center" }}>
          <h1 className="serif" style={{ fontSize: "48px", fontWeight: "900", color: "var(--navy)", marginBottom: "16px" }}>
            Explore Recipes
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 40px" }}>
            Discover culinary secrets from top chefs around the world. Filter by difficulty or search for your favorite ingredient.
          </p>

          {/* Search & Filter Bar */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "24px",
            background: "var(--white)",
            padding: "32px",
            borderRadius: "24px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)"
          }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
              <input 
                type="text" 
                placeholder="Search recipes by title or chef..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "16px 24px 16px 52px", 
                  borderRadius: "16px", 
                  border: "1px solid var(--border-light)", 
                  background: "var(--bg)",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.3s"
                }}
              />
              <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "20px" }}>🔍</span>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {TABS.map(tab => (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: "8px 24px", 
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: activeTab === tab ? "var(--primary)" : "transparent",
                    color: activeTab === tab ? "#fff" : "var(--text-muted)",
                    border: activeTab === tab ? "none" : "1px solid var(--border-light)",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 20px" }}></div>
            <p style={{ color: "var(--text-muted)" }}>Sharpening knives and preparing the grid...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "32px" 
          }}>
            {filtered.map(recipe => (
              <RecipeCard 
                key={recipe._id} 
                recipe={recipe} 
                user={user}
                setUser={setUser}
                setPage={setPage}
                setSelectedChefId={setSelectedChefId}
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setPage("recipe-detail");
                }} 
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🧑‍🍳</div>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--navy)", marginBottom: "8px" }}>No Recipes Found</h3>
            <p style={{ color: "var(--text-muted)" }}>Try searching for something else or explore a different difficulty.</p>
            <button 
              className="btn-secondary" 
              style={{ marginTop: "24px" }}
              onClick={() => { setSearch(""); setActiveTab("All"); }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

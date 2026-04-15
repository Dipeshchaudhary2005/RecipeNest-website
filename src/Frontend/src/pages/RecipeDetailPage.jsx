import { useState, useEffect } from "react";
import { getImageUrl, userAPI, recipeAPI } from "../services/api";

const getInitials = (chef) => {
  const name = typeof chef === "string" ? chef : chef?.name || "Chef";
  const normalized = name.replace(/Chef\s+/i, "").trim();
  const initials = normalized
    .split(" ")
    .filter(Boolean)
    .map((token) => token[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "CH";
};

export default function RecipeDetailPage({ recipe, setPage, onBack, user, setUser }) {
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState({ follow: false, favorite: false });

  useEffect(() => {
    if (user && recipe && recipe.chef) {
      const chefId = typeof recipe.chef === "string" ? null : recipe.chef._id;
      if (chefId) {
        setIsFollowing(user.following?.includes(chefId));
      }
      setIsFavorited(user.favorites?.includes(recipe._id));
    }
  }, [user, recipe]);

  if (!recipe) return null;
  const stepImages = recipe.stepImages || [];
  let imgIdx = 0;

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 100px" }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px", fontWeight: "500" }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: "600" }}>Recipes</button>
          <span>/</span>
          <span style={{ color: "var(--primary)", fontWeight: "700" }}>{recipe.tag}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "60px", alignItems: "start" }}>

          {/* LEFT: Main Content */}
          <div>
            <h1 className="serif" style={{ fontSize: "48px", fontWeight: "900", lineHeight: "1.1", marginBottom: "24px", color: "var(--text-main)" }}>
              {recipe.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "800" }}>
                  {getInitials(recipe.chef)}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>{typeof recipe.chef === "string" ? recipe.chef : recipe.chef?.name || "Chef"}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Published Oct 24, 2023</div>
                </div>
              </div>

              {/* Follow Button */}
              {user && recipe.chef && user._id !== (recipe.chef._id || recipe.chef) && (
                <button 
                  onClick={async () => {
                    if (loading.follow) return;
                    setLoading(prev => ({ ...prev, follow: true }));
                    try {
                      const chefId = recipe.chef._id || recipe.chef;
                      const response = isFollowing 
                        ? await userAPI.unfollowChef(chefId)
                        : await userAPI.followChef(chefId);
                      if (response.data.success) {
                        setIsFollowing(!isFollowing);
                        setUser(response.data.data.user);
                      }
                    } catch (err) {
                      console.error("Follow error:", err);
                    } finally {
                      setLoading(prev => ({ ...prev, follow: false }));
                    }
                  }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: isFollowing ? "1px solid var(--border-light)" : "none",
                    background: isFollowing ? "var(--bg)" : "var(--primary)",
                    color: isFollowing ? "var(--text-main)" : "#fff",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: loading.follow ? "not-allowed" : "pointer",
                    transition: "var(--transition)",
                    opacity: loading.follow ? 0.7 : 1
                  }}
                >
                  {loading.follow ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              )}

              <div style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#f59e0b", fontSize: "18px" }}>★</span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>{recipe.rating}</span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>({recipe.reviews} Reviews)</span>
              </div>
            </div>

            <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-lg)", marginBottom: "50px" }}>
              <img
                src={recipe.image ? getImageUrl(recipe.image) : "https://via.placeholder.com/1200x500?text=No+Image+Available"}
                alt={recipe.title}
                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x500?text=No+Image+Available"; }}
                style={{ width: "100%", height: "500px", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", bottom: "24px", right: "24px" }}>
                <button 
                  onClick={async () => {
                    if (!user) { setPage("login"); return; }
                    if (loading.favorite) return;
                    setLoading(prev => ({ ...prev, favorite: true }));
                    try {
                      const response = await recipeAPI.toggleFavorite(recipe._id);
                      if (response.data.success) {
                        setIsFavorited(!isFavorited);
                        setUser(response.data.data.user);
                      }
                    } catch (err) {
                      console.error("Favorite error:", err);
                    } finally {
                      setLoading(prev => ({ ...prev, favorite: false }));
                    }
                  }}
                  className={isFavorited ? "btn-secondary" : "btn-primary"} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    padding: "10px 20px",
                    background: isFavorited ? "var(--white)" : "var(--primary)",
                    color: isFavorited ? "var(--primary)" : "#fff",
                    border: isFavorited ? "1px solid var(--primary)" : "none"
                  }}
                >
                  <span>{isFavorited ? "❤️" : "🤍"}</span> {isFavorited ? "Saved" : "Save to Favorites"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "50px" }}>
              {/* Ingredients */}
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", borderBottom: "2px solid var(--border-light)", paddingBottom: "12px" }}>
                  <h2 className="serif" style={{ fontSize: "28px", fontWeight: "800" }}>Ingredients</h2>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>{recipe.ingredients.length} items</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0" }}>
                  {recipe.ingredients.map((ing, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleIngredient(i)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "16px", 
                        padding: "16px 0", 
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        transition: "opacity 0.2s"
                      }}
                    >
                      <div style={{ 
                        width: "22px", 
                        height: "22px", 
                        borderRadius: "6px", 
                        border: checkedIngredients[i] ? "none" : "2px solid #cbd5e1",
                        background: checkedIngredients[i] ? "var(--accent-green)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#fff"
                      }}>
                        {checkedIngredients[i] && "✓"}
                      </div>
                      <div style={{ flex: 1, opacity: checkedIngredients[i] ? 0.5 : 1 }}>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", textDecoration: checkedIngredients[i] ? "line-through" : "none" }}>
                          {ing.name}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{ing.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Instructions */}
              <section>
                <h2 className="serif" style={{ fontSize: "28px", fontWeight: "800", marginBottom: "32px", borderBottom: "2px solid var(--border-light)", paddingBottom: "12px" }}>Instructions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
                  {recipe.steps.map((step, i) => {
                    const img = step.hasImage ? stepImages[imgIdx++] : null;
                    return (
                      <div key={i} style={{ display: "flex", gap: "24px" }}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          background: "var(--primary)", 
                          color: "#fff", 
                          fontSize: "16px", 
                          fontWeight: "800", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          flexShrink: 0 
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px" }}>{step.title}</h3>
                          <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: img ? "24px" : "0" }}>{step.body}</p>
                          {img && (
                            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                              <img 
                                src={getImageUrl(img)} 
                                alt={step.title} 
                                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x300?text=Image+Unavailable"; }}
                                style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside style={{ position: "sticky", top: "100px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: "28px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)", fontSize: "14px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px" }}>
                📋 Recipe Overview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {[
                  { icon: "⏱️", label: "Prep Time", val: recipe.prepTime },
                  { icon: "🔥", label: "Cook Time", val: recipe.cookTime },
                  { icon: "👥", label: "Servings", val: recipe.servings },
                  { icon: "⚡", label: "Calories", val: recipe.calories },
                  { icon: "📈", label: "Difficulty", val: recipe.difficulty },
                  { icon: "🌍", label: "Cuisine", val: recipe.cuisine }
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>{item.icon}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>{item.val}</div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" style={{ width: "100%", marginTop: "32px", fontSize: "14px", fontWeight: "700" }}>
                Print Full Recipe
              </button>
            </div>

            {recipe.tip && (
              <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fff 100%)", borderRadius: "var(--radius-lg)", border: "1px solid #fed7aa", padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c2410c", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  💡 Chef's Secret Tip
                </div>
                <p style={{ fontSize: "14px", color: "#7c2d12", lineHeight: "1.6", fontWeight: "500", fontStyle: "italic" }}>
                  "{recipe.tip}"
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

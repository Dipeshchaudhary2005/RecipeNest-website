import { useState, useEffect } from "react";
import { recipeAPI } from "../../services/api";
import CreateRecipeModal from "../../components/CreateRecipeModal";
import SettingsModal from "../../components/SettingsModal";
import RecipeCard from "../../components/RecipeCard";
import ProfileUpdateModal from "../../components/ProfileUpdateModal";
import { getImageUrl } from "../../utils";

const NAV = [
  { icon: "🏠", label: "Feed", id: "feed" },
  { icon: "👨‍🍳", label: "My Creations", id: "creations" },
  { icon: "📈", label: "Analytics", id: "analytics" },
];

const TABS = ["All Recipes", "Live", "Pending Review", "Rejected"];
const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegetarian", "Seafood"];

const STATUS_BADGE = {
  Live: "badge-live",
  "Pending Review": "badge-pending",
  Rejected: "badge-rejected",
};

export default function ChefDashboardPage({ setPage, setSelectedRecipe, user, setUser, onLogout }) {
  const [activeNav, setActiveNav] = useState("feed");
  const [activeTab, setActiveTab] = useState("All Recipes");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [feedRecipes, setFeedRecipes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayName = user?.name ? user.name : "Chef";
  const displayRole = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Chef";

  const sectionTitles = {
    feed: "Community Feed",
    creations: "My Masterpieces",
    analytics: "Performance Insights",
  };

  useEffect(() => {
    if (activeNav === "creations") {
      fetchMyRecipes();
    } else if (activeNav === "feed") {
      fetchFeed();
    }
  }, [activeNav]);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getMyRecipes();
      if (response.data.success) {
        setRecipes(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching chef recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll({ status: "Live", limit: 50 });
      if (response.data.success) {
        setFeedRecipes(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreations = activeTab === "All Recipes" 
    ? recipes 
    : recipes.filter(r => r.status === activeTab);

  const filteredFeed = activeCategory === "All"
    ? feedRecipes
    : feedRecipes.filter(r => r.tag === activeCategory || r.cuisine === activeCategory);

  return (
    <div className="sidebar-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ padding: "0 8px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#fff" }}>🍽</div>
            <span className="serif" style={{ fontSize: "18px", fontWeight: "700", color: "var(--navy)" }}>RecipeNest</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV.map(item => (
              <button 
                key={item.id} 
                className={`sidebar-item ${activeNav === item.id ? "active" : ""}`} 
                onClick={() => setActiveNav(item.id)}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto", padding: "20px 8px 0", borderTop: "1px solid var(--border-light)" }}>
          <button className="sidebar-item" style={{ marginBottom: "16px", width: "100%", background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsSettingsOpen(true)}>
            <span style={{ fontSize: "18px" }}>⚙️</span> Settings
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-md)", marginBottom: "16px", border: "1px solid var(--border-light)" }}>
            <div className="sidebar-avatar" style={{ width: "40px", height: "40px", fontSize: "14px", fontWeight: "700", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", overflow: "hidden" }}>
              {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : displayName.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{displayName}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{displayRole}</div>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* DASHBOARD CONTENT */}
      <main className="page-content" style={{ background: "var(--bg)", overflow: "hidden" }}>
        <div className="page-header" style={{ marginBottom: "32px" }}>
          <div>
            <h1 className="page-title">{sectionTitles[activeNav] || "Dashboard"}</h1>
            <p className="page-sub">
              {activeNav === "feed" ? "Stay inspired by fellow chefs" :
               activeNav === "creations" ? "Hi " + displayName + ", manage your culinary portfolio" :
               "Hi " + displayName + ", track your impact and growth"}
            </p>
          </div>
          {activeNav === "creations" && (
            <button 
              className="action-cta" 
              style={{ filter: "drop-shadow(0 4px 12px rgba(255, 49, 49, 0.2))" }}
              onClick={() => setIsModalOpen(true)}
            >
              <span style={{ fontSize: "18px" }}>+</span> Create New Recipe
            </button>
          )}
        </div>

        {activeNav === "feed" ? (
          // Social Feed View
          <div className="scroll-container">
            {/* Category Filter Bar */}
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              marginBottom: "32px", 
              overflowX: "auto", 
              paddingBottom: "8px",
              msOverflowStyle: "none",
              scrollbarWidth: "none"
            }}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    border: "4px solid var(--border-light)", 
                    borderTop: "4px solid var(--primary)", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px"
                  }} />
                  <p style={{ color: "var(--text-muted)" }}>Plating up the feed...</p>
                </div>
              ) : filteredFeed.length > 0 ? (
                filteredFeed.map(recipe => (
                  <RecipeCard 
                    key={recipe._id} 
                    recipe={recipe} 
                    variant="feed"
                    onClick={(r) => {
                      setSelectedRecipe(r);
                      setPage("recipe-detail");
                    }}
                  />
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "60px", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "700" }}>No recipes found here</h3>
                  <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Try a different category or search for something specific.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeNav === "creations" ? (
          <div className="scroll-container">
            {/* Stats Row */}
            <div className="stats-row" style={{ marginBottom: "40px" }}>
              {[
                { label: "Total Recipes", val: recipes.length.toString(), icon: "📝", bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
                { label: "Average Rating", val: "4.8", icon: "⭐", bg: "rgba(234, 179, 8, 0.1)", color: "#eab308" },
                { label: "Community Saves", val: "1.2k", icon: "🔖", bg: "rgba(16, 185, 129, 0.1)", color: "#10b981" }
              ].map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
                  <div>
                    <div className="stat-val">{stat.val}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tab-bar" style={{ marginBottom: "32px" }}>
              {TABS.map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`} 
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: "12px 24px" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Recipe Grid */}
            {loading ? (
               <div style={{ textAlign: "center", padding: "40px" }}>
                 <div className="spinner" style={{ margin: "0 auto" }}></div>
               </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {filteredCreations.map(recipe => (
                  <div 
                    key={recipe._id} 
                    className="card-hover"
                    onClick={() => { setSelectedRecipe(recipe); setPage("recipe-detail"); }}
                    style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", cursor: "pointer", transition: "var(--transition)" }}
                  >
                    <div style={{ position: "relative", height: "180px" }}>
                      <img src={getImageUrl(recipe.image)} alt={recipe.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span className={`badge ${STATUS_BADGE[recipe.status]}`} style={{ position: "absolute", top: "12px", left: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        ● {recipe.status}
                      </span>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{recipe.title}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Published {new Date(recipe.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", padding: "0 20px 20px" }}>
                      {[
                        { icon: "✏️", label: "Edit" },
                        { icon: "📊", label: "Stats" },
                        { icon: "🗑️", label: "Delete" }
                      ].map(action => (
                        <button 
                          key={action.label}
                          style={{ 
                            flex: 1, 
                            background: "var(--bg)", 
                            border: "1px solid var(--border-light)", 
                            padding: "8px", 
                            borderRadius: "8px", 
                            fontSize: "14px",
                            transition: "var(--transition)"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* New Draft Placeholder */}
                <div 
                  onClick={() => setIsModalOpen(true)}
                  style={{ 
                    background: "var(--white)", 
                    border: "2px dashed var(--border-light)", 
                    borderRadius: "var(--radius-lg)", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    minHeight: "300px", 
                    padding: "40px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-light)"}
                >
                  <div style={{ width: "56px", height: "56px", background: "var(--bg)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px" }}>➕</div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>New Masterpiece?</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.5" }}>Start drafting your next culinary creation.</p>
                  <button className="btn-secondary" style={{ padding: "8px 24px", fontSize: "13px" }}>Start Draft</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
             <div style={{ width: "120px", height: "120px", borderRadius: "40px", background: "var(--primary)", color: "white", fontSize: "40px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : displayName.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)" }}>{displayName}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>{user?.email}</p>
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ flex: 1, minWidth: "200px", padding: "20px", background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "4px" }}>PHONE</div>
                  <div style={{ fontWeight: "700" }}>{user?.phone || "Not provided"}</div>
                </div>
                <div style={{ flex: 1, minWidth: "200px", padding: "20px", background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "4px" }}>ADDRESS</div>
                  <div style={{ fontWeight: "700" }}>{user?.address || "Not provided"}</div>
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ marginTop: "40px", padding: "14px 40px" }}
                onClick={() => setIsProfileOpen(true)}
              >
                Edit My Profile
              </button>
          </div>
        )}

        <CreateRecipeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchMyRecipes} 
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user} 
        />

        <ProfileUpdateModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user} 
          onUpdate={(updated) => setUser(updated)} 
        />
      </main>
    </div>
  );
}

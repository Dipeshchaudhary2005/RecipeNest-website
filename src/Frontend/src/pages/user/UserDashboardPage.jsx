import { useState, useEffect } from "react";
import { recipeAPI, userAPI } from "../../services/api";
import RecipeCard from "../../components/RecipeCard";
import SettingsModal from "../../components/SettingsModal";
import ProfileUpdateModal from "../../components/ProfileUpdateModal";
import { getImageUrl } from "../../utils";

const NAV = [
  { icon: "🏠", label: "Feed", id: "feed" },
  { icon: "❤️", label: "Favorites", id: "favorites" },
  { icon: "👥", label: "Following", id: "following" },
  { icon: "👤", label: "Profile", id: "profile" },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegetarian", "Seafood"];

export default function UserDashboardPage({ setPage, setSelectedRecipe, setSelectedChefId, user, setUser, onLogout }) {
  const [activeNav, setActiveNav] = useState("feed");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeNav === "feed") {
      fetchFeed();
    }

    const onRecipeUpdated = (event) => {
      const updatedRecipe = event.detail;
      setRecipes(prev => prev.map(r => r._id === updatedRecipe._id ? updatedRecipe : r));
    };

    window.addEventListener("recipe-updated", onRecipeUpdated);
    return () => window.removeEventListener("recipe-updated", onRecipeUpdated);
  }, [activeNav]);

  useEffect(() => {
    // Check if profile is incomplete (missing essential info)
    const isProfileIncomplete = !user?.phone || !user?.address;
    if (isProfileIncomplete && localStorage.getItem("justLoggedIn") === "true") {
      setIsProfileOpen(true);
      localStorage.removeItem("justLoggedIn");
    }
  }, [user]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll({ status: "Live", limit: 50 });
      if (response.data.success) {
        const data = response.data.data;
        setRecipes(Array.isArray(data) ? data : data.recipes || []);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (activeNav === "feed") {
      return recipes.filter(r => {
        const matchesCategory = activeCategory === "All" || r.tag === activeCategory || r.cuisine === activeCategory;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              r.chef?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }
    
    if (activeNav === "favorites") {
      const favorites = user?.favorites || [];
      return favorites.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.chef?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeNav === "following") {
      const following = user?.following || [];
      return following.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [];
  };

  const filteredItems = getFilteredItems();

  const renderFeed = () => (
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

      <div style={{ position: "relative", marginBottom: "32px", width: "100%", maxWidth: "500px" }}>
        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--text-muted)" }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search recipes, chefs, or ingredients..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "14px 16px 14px 48px", 
            borderRadius: "18px", 
            border: "1px solid var(--border-light)", 
            background: "var(--white)", 
            outline: "none",
            fontSize: "14px",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(recipe => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              user={user}
              setUser={setUser}
              setPage={setPage}
              setSelectedChefId={setSelectedChefId}
              onClick={(r) => {
                setSelectedRecipe(r);
                setPage("recipe-detail");
              }}
            />
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>No recipes in this category</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Try exploring a different taste or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="scroll-container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map(recipe => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              user={user}
              setUser={setUser}
              setPage={setPage}
              setSelectedChefId={setSelectedChefId}
              onClick={(r) => {
                setSelectedRecipe(r);
                setPage("recipe-detail");
              }}
            />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{searchQuery ? "🔍" : "❤️"}</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{searchQuery ? "No matches found" : "Your favorite list is empty"}</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {searchQuery ? "Try searching for something else." : "Save recipes you love to see them here later!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFollowing = () => (
    <div className="scroll-container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map(chef => (
            <div key={chef._id} style={{ 
              background: "var(--white)", 
              padding: "24px", 
              borderRadius: "24px", 
              border: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                borderRadius: "20px", 
                background: "var(--primary)", 
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "700"
              }}>
                {chef.avatar ? (
                  <img src={getImageUrl(chef.avatar)} alt={chef.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  chef.name?.[0].toUpperCase()
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", color: "var(--navy)", fontSize: "16px" }}>{chef.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{chef.role === 'chef' ? 'Professional Chef' : 'Community Expert'}</div>
                <button 
                  onClick={async () => {
                    try {
                      const res = await userAPI.unfollowChef(chef._id);
                      if (res.data.success) setUser(res.data.data.user);
                    } catch (err) { console.error(err); }
                  }}
                  style={{ 
                    background: "rgba(239, 68, 68, 0.1)", 
                    color: "#ef4444", 
                    border: "none", 
                    padding: "6px 12px", 
                    borderRadius: "8px", 
                    fontSize: "12px", 
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{searchQuery ? "🔍" : "👥"}</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{searchQuery ? "No matches found" : "You're not following anyone yet"}</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {searchQuery ? "Try searching for another chef." : "Explore the feed to find chefs and follow them to see them here!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

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
              {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.name?.[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{user?.name || "User"}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Home Cook</div>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="page-content" style={{ background: "var(--bg)", overflow: "hidden" }}>
        <div className="page-header" style={{ marginBottom: "32px" }}>
          <div>
            <h1 className="page-title">
              {activeNav === "feed" ? "Recipe Feed" : activeNav === "favorites" ? "Saved Recipes" : activeNav === "following" ? "Following" : "My Profile"}
            </h1>
            <p className="page-sub">
              {activeNav === "feed" ? "Trending recipes from the community" : activeNav === "favorites" ? "Recipes you've favorited for later" : activeNav === "following" ? "Chefs you're currently following" : "Manage your personal information"}
            </p>
          </div>
        </div>

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
            <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Whisking up some goodness...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", borderRadius: "16px" }}>
            {error}
          </div>
        ) : (
          activeNav === "feed" ? renderFeed() : 
          activeNav === "favorites" ? renderFavorites() : 
          activeNav === "following" ? renderFollowing() : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 24px" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "40px", background: "var(--primary)", color: "white", fontSize: "40px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "4px solid var(--white)" }}>
                  {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.name?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  style={{ position: "absolute", bottom: "0", right: "0", width: "36px", height: "36px", borderRadius: "12px", background: "var(--navy)", color: "white", border: "2px solid var(--white)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  ✏️
                </button>
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy)", marginBottom: "4px" }}>{user?.name}</h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                 <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", background: "var(--bg)", padding: "4px 12px", borderRadius: "99px" }}>Home Cook</span>
                 {user?.specialty && <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>• {user.specialty}</span>}
              </div>

              <p style={{ color: "var(--text-main)", fontSize: "15px", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto 32px", fontStyle: user?.bio ? "normal" : "italic" }}>
                {user?.bio || "No bio provided yet. Click edit to tell the community about your cooking style!"}
              </p>
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ flex: 1, minWidth: "200px", padding: "20px", background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)", textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "4px" }}>EMAIL</div>
                  <div style={{ fontWeight: "700", color: "var(--navy)" }}>{user?.email}</div>
                </div>
                <div style={{ flex: 1, minWidth: "200px", padding: "20px", background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)", textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "4px" }}>PHONE</div>
                  <div style={{ fontWeight: "700", color: "var(--navy)" }}>{user?.phone || "Not provided"}</div>
                </div>
                <div style={{ width: "100%", padding: "20px", background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)", textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "4px" }}>ADDRESS</div>
                  <div style={{ fontWeight: "700", color: "var(--navy)" }}>{user?.address || "Not provided"}</div>
                </div>
              </div>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: "14px 60px", borderRadius: "14px" }}
                  onClick={() => setIsProfileOpen(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )
        )}
      </main>

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
    </div>
  );
}

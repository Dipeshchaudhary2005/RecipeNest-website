import { useState, useEffect } from "react";
import { recipeAPI, userAPI } from "../../services/api";
import CreateRecipeModal from "../../components/CreateRecipeModal";
import SettingsModal from "../../components/SettingsModal";
import RecipeCard from "../../components/RecipeCard";
import ProfileUpdateModal from "../../components/ProfileUpdateModal";
import { getImageUrl } from "../../utils";

const NAV = [
  { icon: "🏠", label: "Feed", id: "feed" },
  { icon: "👨‍🍳", label: "My Creations", id: "creations" },
  { icon: "👥", label: "Followers", id: "followers" },
  { icon: "👤", label: "Profile", id: "profile" },
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
  const [myStats, setMyStats] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followersTab, setFollowersTab] = useState("notifications"); // notifications | followers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const displayName = user?.name ? user.name : "Chef";
  const displayRole = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Chef";

  const sectionTitles = {
    feed: "Community Feed",
    creations: "My Masterpieces",
    followers: "Followers & Notifications",
    profile: "Chef Profile",
  };

  useEffect(() => {
    if (activeNav === "creations") {
      fetchMyRecipes();
      fetchMyStats();
    } else if (activeNav === "feed") {
      fetchFeed();
    } else if (activeNav === "followers") {
      fetchFollowers();
      fetchNotifications();
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

  const fetchMyStats = async () => {
    try {
      const res = await recipeAPI.getMyStats();
      if (res.data.success) setMyStats(res.data.data);
    } catch (err) {
      console.error("Error fetching chef stats:", err);
      setMyStats(null);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll({ status: "Live", limit: 50 });
      if (response.data.success) {
        const data = response.data.data;
        setFeedRecipes(Array.isArray(data) ? data : data.recipes || []);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.read) return;
    try {
      await userAPI.markNotificationsRead([notification._id]);
      fetchNotifications();
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMyFollowers();
      if (res.data.success) {
        setFollowers(res.data.data.followers || []);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await userAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const filteredCreations = recipes.filter(r => {
    const matchesTab = activeTab === "All Recipes" || r.status === activeTab;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredFeed = feedRecipes.filter(r => {
    const matchesCategory = activeCategory === "All" || r.tag === activeCategory || r.cuisine === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.chef?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {item.label}
                  {item.id === "followers" && unreadCount > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: "900", padding: "2px 8px", borderRadius: "99px", background: "rgba(255,49,49,0.12)", color: "var(--primary)", border: "1px solid rgba(255,49,49,0.22)" }}>
                      {unreadCount}
                    </span>
                  )}
                </span>
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
               activeNav === "followers" ? "Hi " + displayName + ", track your impact and growth" :
               "View and edit your public chef profile"}
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
        
        {(activeNav === "feed" || activeNav === "creations") && (
          <div style={{ position: "relative", marginBottom: "24px", width: "100%", maxWidth: "450px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--text-muted)" }}>🔍</span>
            <input 
              type="text" 
              placeholder={activeNav === "feed" ? "Search dishes or chefs..." : "Search your recipes..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px 12px 48px", 
                borderRadius: "16px", 
                border: "1px solid var(--border-light)", 
                background: "var(--white)", 
                outline: "none",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
            />
          </div>
        )}

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
                { label: "Total Recipes", val: (myStats?.totalRecipes ?? recipes.length).toString(), icon: "📝", bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
                { label: "Average Rating", val: (myStats?.avgRating ?? 0).toString(), icon: "⭐", bg: "rgba(234, 179, 8, 0.1)", color: "#eab308" },
                { label: "Community Saves", val: (myStats?.totalSaves ?? 0).toString(), icon: "🔖", bg: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
                { label: "Engagement", val: `${myStats?.engagementScore ?? 0}%`, icon: "📣", bg: "rgba(255, 49, 49, 0.1)", color: "var(--primary)" },
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

            {/* Recent creations */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Recent creations
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--navy)", marginTop: "4px" }}>
                    Latest recipes you submitted
                  </div>
                </div>
                <button
                  onClick={() => { fetchMyRecipes(); fetchMyStats(); }}
                  style={{ background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                >
                  Refresh
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                {(myStats?.recent || recipes.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)).map((r) => (
                  <div
                    key={r._id}
                    className="card-hover"
                    onClick={() => { setSelectedRecipe(r); setPage("recipe-detail"); }}
                    style={{ background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: "18px", overflow: "hidden", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", gap: "12px", padding: "14px" }}>
                      <div style={{ width: "62px", height: "62px", borderRadius: "14px", overflow: "hidden", background: "var(--bg)", flex: "0 0 auto" }}>
                        <img
                          src={getImageUrl(r.image)}
                          alt={r.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getImageUrl("https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=60"); }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.title}
                          </div>
                          <span className={`badge ${STATUS_BADGE[r.status] || ""}`} style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                            ● {r.status || "Draft"}
                          </span>
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </div>
                        <div style={{ marginTop: "8px", display: "flex", gap: "10px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                          <span>⭐ {(r.rating ?? 0).toFixed ? (r.rating ?? 0).toFixed(1) : (r.rating ?? 0)}</span>
                          <span>💬 {r.reviews ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      <img
                        src={getImageUrl(recipe.image)}
                        alt={recipe.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getImageUrl("https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80");
                        }}
                      />
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
        ) : activeNav === "followers" ? (
      <div className="scroll-container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
              <div style={{ display: "flex", gap: "10px", background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "6px" }}>
                {[
                  { id: "notifications", label: `Notifications${unreadCount ? ` (${unreadCount})` : ""}` },
                  { id: "followers", label: `Followers (${followers.length})` },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFollowersTab(t.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "none",
                      background: followersTab === t.id ? "rgba(255,49,49,0.12)" : "transparent",
                      color: followersTab === t.id ? "var(--primary)" : "var(--text-muted)",
                      fontWeight: "900",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => { fetchFollowers(); fetchNotifications(); }}
                  className="btn-secondary"
                  style={{ padding: "10px 14px", borderRadius: "12px" }}
                >
                  Refresh
                </button>
                <button
                  onClick={async () => {
                    try {
                      await userAPI.markNotificationsRead();
                      await fetchNotifications();
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="btn-primary"
                  style={{ padding: "10px 14px", borderRadius: "12px" }}
                >
                  Mark all read
                </button>
              </div>
            </div>

            {followersTab === "notifications" ? (
              <div style={{ display: "grid", gap: "12px" }}>
                {notifications.length === 0 ? (
                  <div style={{ background: "var(--white)", border: "1px dashed var(--border-light)", borderRadius: "18px", padding: "18px", color: "var(--text-muted)" }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id || `${n.type}-${n.createdAt}`}
                      style={{
                        background: n.read ? "var(--white)" : "rgba(255,49,49,0.03)",
                        border: `1px solid ${n.read ? "var(--border-light)" : "rgba(255,49,49,0.15)"}`,
                        borderRadius: "18px",
                        padding: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: n.read ? "default" : "pointer",
                        transition: "all 0.2s ease",
                        opacity: n.read ? 0.75 : 1
                      }}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div style={{ width: "46px", height: "46px", borderRadius: "14px", overflow: "hidden", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "var(--primary)" }}>
                        {n.actor?.avatar ? (
                          <img src={getImageUrl(n.actor.avatar)} alt={n.actor?.name || "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          (n.actor?.name || "U")[0]?.toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "900", color: n.read ? "var(--text-muted)" : "var(--navy)", fontSize: "14px" }}>
                          {n.message || (n.type === "follow" ? "New follower" : "Recipe saved")}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                          {!n.read && <span style={{ color: "var(--primary)", fontWeight: "900" }}>• New</span>}
                        </div>
                      </div>
                      {n.recipe?._id && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "10px 12px", borderRadius: "12px", whiteSpace: "nowrap" }}
                          onClick={() => {
                            setSelectedRecipe({ _id: n.recipe._id, title: n.recipe.title, image: n.recipe.image });
                            setPage("recipe-detail");
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                {followers.length === 0 ? (
                  <div style={{ background: "var(--white)", border: "1px dashed var(--border-light)", borderRadius: "18px", padding: "18px", color: "var(--text-muted)" }}>
                    No followers yet.
                  </div>
                ) : (
                  followers.map((f) => (
                    <div key={f._id} style={{ background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: "18px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "50px", height: "50px", borderRadius: "16px", overflow: "hidden", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "var(--primary)" }}>
                        {f.avatar ? (
                          <img src={getImageUrl(f.avatar)} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          (f.name || "U")[0]?.toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "900", color: "var(--navy)" }}>{f.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Followed since {new Date(f.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge" style={{ background: "rgba(59,130,246,0.10)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.18)" }}>
                        {f.role || "user"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : activeNav === "profile" ? (
          <div className="scroll-container" style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 24px" }}>
              <div style={{ width: "140px", height: "140px", borderRadius: "48px", background: "var(--primary)", color: "white", fontSize: "48px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "4px solid var(--white)" }}>
                {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (displayName || "C")[0].toUpperCase()}
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)}
                style={{ position: "absolute", bottom: "0", right: "0", width: "42px", height: "42px", borderRadius: "14px", background: "var(--navy)", color: "white", border: "3px solid var(--white)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px" }}
              >
                ✏️
              </button>
            </div>

            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>{user?.name}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
              <span className="badge-live" style={{ padding: "6px 16px", borderRadius: "99px", fontSize: "13px", fontWeight: "800" }}>Professional Chef</span>
              {user?.specialty && <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>• {user.specialty}</span>}
            </div>

            <p style={{ color: "var(--text-main)", fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto 40px", fontStyle: user?.bio ? "normal" : "italic" }}>
              {user?.bio || "No bio provided yet. Add one to let the community know about your culinary journey!"}
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
              {[
                { label: "EMAIL", val: user?.email, icon: "📧" },
                { label: "PHONE", val: user?.phone || "Not provided", icon: "📞" },
                { label: "ADDRESS", val: user?.address || "Not provided", icon: "📍" },
                { label: "FOLLOWERS", val: followers.length.toString(), icon: "👥" }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "24px", background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)", textAlign: "left", display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "800", letterSpacing: "0.05em" }}>{item.label}</div>
                    <div style={{ fontWeight: "700", color: "var(--navy)", marginTop: "2px" }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "48px", display: "flex", justifyContent: "center" }}>
              <button 
                className="btn-primary" 
                style={{ padding: "16px 60px", borderRadius: "18px" }}
                onClick={() => setIsProfileOpen(true)}
              >
                Edit Full Profile
              </button>
            </div>
          </div>
        ) : null}

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

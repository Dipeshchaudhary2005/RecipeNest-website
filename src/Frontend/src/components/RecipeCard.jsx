import { getImageUrl, recipeAPI, userAPI } from "../services/api";
import { useState } from "react";

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

const cardStyles = `
  .rn-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 1px solid var(--border-light);
  }
  .rn-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
  }
  .rn-card-img-wrap {
    position: relative;
    height: 240px;
    overflow: hidden;
  }
  .rn-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: block;
  }
  .rn-card:hover .rn-card-img {
    transform: scale(1.1);
  }
  .rn-diff-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(17, 17, 22, 0.7);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .rn-tag-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 6px 12px;
    border-radius: 99px;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .rn-card-body {
    padding: 24px;
  }
  .rn-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .rn-card-desc {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .rn-card-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  .rn-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
  }
  .rn-card-divider {
    height: 1.5px;
    background: #f1f5f9;
    margin-bottom: 18px;
  }
  .rn-chef-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .rn-chef-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .rn-chef-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #c0392b);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #fff;
    font-weight: 800;
  }
  .rn-chef-name {
    font-size: 13px;
    color: var(--text-main);
    font-weight: 600;
  }
  .rn-view-link {
    font-size: 12px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export default function RecipeCard({ recipe, onClick, user, setUser, setPage, variant = "grid" }) {
  const [loading, setLoading] = useState({ follow: false, favorite: false });

  const isFavorited = user?.favorites?.some(f => (f._id || f) === recipe._id);
  const isFollowing = user?.following?.some(f => (f._id || f) === (recipe.chef?._id || recipe.chef));

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) { setPage && setPage("login"); return; }
    if (loading.favorite) return;
    setLoading(prev => ({ ...prev, favorite: true }));
    try {
      const res = await recipeAPI.toggleFavorite(recipe._id);
      if (res.data.success) setUser(res.data.data.user);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({ ...prev, favorite: false })); }
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) { setPage && setPage("login"); return; }
    if (loading.follow) return;
    setLoading(prev => ({ ...prev, follow: true }));
    try {
      const chefId = recipe.chef?._id || recipe.chef;
      const res = isFollowing ? await userAPI.unfollowChef(chefId) : await userAPI.followChef(chefId);
      if (res.data.success) setUser(res.data.data.user);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({ ...prev, follow: false })); }
  };
  if (variant === "feed") {
    return (
      <div className="feed-post card-hover">
        <div className="feed-post-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="sidebar-avatar" style={{ width: "42px", height: "42px", fontSize: "14px", fontWeight: "700", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", overflow: "hidden" }}>
              {recipe.chef?.avatar ? (
                <img src={getImageUrl(recipe.chef.avatar)} alt="Chef" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                getInitials(recipe.chef?.name || recipe.chef || "Chef")
              )}
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", lineHeight: "1.2" }}>
                {recipe.chef?.name || recipe.chef || "Chef"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "Just now"} • 🌎
              </div>
            </div>
          </div>
          <button style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-muted)", cursor: "pointer", padding: "8px", borderRadius: "50%" }}>
            <span style={{ transform: "rotate(90deg)", display: "inline-block" }}>•••</span>
          </button>
        </div>

        <div className="feed-post-body">
          <h3 style={{ 
            fontSize: "22px", 
            fontWeight: "900", 
            marginBottom: "10px", 
            fontFamily: "'Playfair Display', serif",
            color: "var(--navy)",
            letterSpacing: "-0.5px"
          }}>
            {recipe.title}
          </h3>
          <p style={{ 
            fontSize: "14.5px", 
            color: "var(--text-main)", 
            marginBottom: "16px", 
            lineHeight: "1.6",
            opacity: 0.9
          }}>
            {recipe.description}
          </p>
        </div>

        <div className="feed-post-image-container" style={{ position: "relative", overflow: "hidden", background: "#f8f9fa" }}>
          <img 
            className="feed-post-image" 
            src={getImageUrl(recipe.image)} 
            alt={recipe.title} 
            onClick={() => onClick && onClick(recipe)}
            style={{ 
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "block"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getImageUrl(null);
            }}
          />
          <div style={{ position: "absolute", bottom: "16px", left: "16px", display: "flex", gap: "8px" }}>
            <span className="badge" style={{ background: "rgba(255,255,255,0.9)", color: "var(--navy)", backdropFilter: "blur(4px)", border: "none" }}>{recipe.difficulty}</span>
            <span className="badge" style={{ background: "rgba(255,49,49,0.9)", color: "#fff", backdropFilter: "blur(4px)", border: "none" }}>{recipe.tag || "New"}</span>
          </div>
          <button 
            onClick={handleFavorite}
            style={{
              position: "absolute", top: "16px", right: "16px", width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(255,255,255,0.9)", border: "none", fontSize: "18px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "var(--transition)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
        </div>

        <div className="feed-post-actions" style={{ padding: "16px 20px" }}>
          <button className="action-btn" style={{ fontSize: "14px" }}>
            <span style={{ fontSize: "18px" }}>🔥</span> Like
          </button>
          <button className="action-btn" style={{ fontSize: "14px" }}>
            <span style={{ fontSize: "18px" }}>💬</span> Comment
          </button>
          <button className="action-btn" style={{ fontSize: "14px" }}>
            <span style={{ fontSize: "18px" }}>🔖</span> Save
          </button>
          <button className="action-btn" style={{ marginLeft: "auto", fontSize: "14px" }}>
            <span style={{ fontSize: "18px" }}>🚀</span> Share
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{cardStyles}</style>
      <div className="rn-card" onClick={() => onClick && onClick(recipe)}>
        <div className="rn-card-img-wrap">
          <img
            className="rn-card-img"
            src={recipe.image ? getImageUrl(recipe.image) : "https://via.placeholder.com/600x420?text=No+Image"}
            alt={recipe.title}
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x420?text=No+Image"; }}
          />
          <button 
            onClick={handleFavorite}
            style={{
              position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "10px",
              background: "rgba(255,255,255,0.92)", border: "none", fontSize: "16px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "all 0.3s ease", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
          <span className="rn-diff-badge">{recipe.difficulty}</span>
          <span className="rn-tag-badge" style={{ background: recipe.tagColor || "var(--primary)" }}>{recipe.tag}</span>
        </div>
        <div className="rn-card-body">
          <h3 className="rn-card-title">{recipe.title}</h3>
          <p className="rn-card-desc">{recipe.description}</p>
          <div className="rn-card-meta">
            <span className="rn-meta-item"><span style={{fontSize: '16px'}}>⏱</span> {recipe.time || "20m"}</span>
            <span className="rn-meta-item"><span style={{fontSize: '16px'}}>👥</span> {recipe.servings || 1} serving{(recipe.servings || 1) > 1 ? 's' : ''}</span>
          </div>
          <div className="rn-card-divider" />
          <div className="rn-chef-row">
            <div className="rn-chef-info">
              <div className="rn-chef-avatar">{getInitials(recipe.chef?.name || recipe.chef || "Chef")}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="rn-chef-name">{recipe.chef?.name || recipe.chef || "Chef"}</span>
                {user && recipe.chef && user._id !== (recipe.chef._id || recipe.chef) && (
                  <button 
                    onClick={handleFollow}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "11px", fontWeight: "700", cursor: "pointer", padding: "0", textAlign: "left" }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
            <span className="rn-view-link">View Recipe →</span>
          </div>
        </div>
      </div>
    </>
  );
}

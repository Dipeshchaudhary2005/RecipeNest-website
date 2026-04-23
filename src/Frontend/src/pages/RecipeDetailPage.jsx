import { useMemo, useState, useEffect } from "react";
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
  const [liveRecipe, setLiveRecipe] = useState(recipe);
  const [reviewsData, setReviewsData] = useState({ rating: 0, reviews: 0, reviewList: [] });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (user && liveRecipe && liveRecipe.chef) {
      const chefId = typeof liveRecipe.chef === "string" ? null : liveRecipe.chef._id;
      if (chefId) {
        setIsFollowing(user.following?.includes(chefId));
      }
      setIsFavorited(user.favorites?.includes(liveRecipe._id));
    }
  }, [user, liveRecipe]);

  useEffect(() => {
    setLiveRecipe(recipe);
  }, [recipe]);

  useEffect(() => {
    const id = recipe?._id;
    if (!id) return;
    (async () => {
      try {
        const [recipeRes, reviewsRes] = await Promise.all([
          recipeAPI.getById(id),
          recipeAPI.getReviews(id),
        ]);
        if (recipeRes.data?.success) setLiveRecipe(recipeRes.data.data);
        if (reviewsRes.data?.success) setReviewsData(reviewsRes.data.data);
      } catch (e) {
        // ignore
      }
    })();
  }, [recipe?._id]);

  const myExistingReview = useMemo(() => {
    const uid = user?._id;
    if (!uid) return null;
    return (reviewsData.reviewList || []).find((r) => (r.user?._id || r.user) === uid) || null;
  }, [reviewsData.reviewList, user?._id]);

  useEffect(() => {
    if (myExistingReview) {
      setReviewForm({
        rating: myExistingReview.rating || 5,
        comment: myExistingReview.comment || "",
      });
    }
  }, [myExistingReview]);

  if (!liveRecipe) return null;
  const stepImages = liveRecipe.stepImages || [];
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
              {liveRecipe.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "800" }}>
                  {getInitials(recipe.chef)}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>{typeof liveRecipe.chef === "string" ? liveRecipe.chef : liveRecipe.chef?.name || "Chef"}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Published Oct 24, 2023</div>
                </div>
              </div>

              {/* Follow Button */}
              {user && liveRecipe.chef && user._id !== (liveRecipe.chef._id || liveRecipe.chef) && (
                <button 
                  onClick={async () => {
                    if (loading.follow) return;
                    setLoading(prev => ({ ...prev, follow: true }));
                    try {
                      const chefId = liveRecipe.chef._id || liveRecipe.chef;
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
                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>{reviewsData.rating ?? liveRecipe.rating}</span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>({reviewsData.reviews ?? liveRecipe.reviews} Reviews)</span>
              </div>
            </div>

            <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-lg)", marginBottom: "50px" }}>
              <img
                src={liveRecipe.image ? getImageUrl(liveRecipe.image) : "https://via.placeholder.com/1200x500?text=No+Image+Available"}
                alt={liveRecipe.title}
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
                      const response = await recipeAPI.toggleFavorite(liveRecipe._id);
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
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>{liveRecipe.ingredients.length} items</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0" }}>
                  {liveRecipe.ingredients.map((ing, i) => (
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
                  {liveRecipe.steps.map((step, i) => {
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

              {/* Reviews */}
              <section>
                <h2 className="serif" style={{ fontSize: "28px", fontWeight: "800", marginBottom: "18px", borderBottom: "2px solid var(--border-light)", paddingBottom: "12px" }}>
                  Reviews & Ratings
                </h2>

                {/* Review form */}
                <div style={{ background: "#f8fafc", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "18px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--navy)" }}>
                      {user ? (myExistingReview ? "Update your review" : "Leave a review") : "Login to leave a review"}
                    </div>
                    {!user && (
                      <button className="btn-primary" onClick={() => setPage("login")} style={{ padding: "10px 16px" }}>
                        Login
                      </button>
                    )}
                  </div>

                  {user && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmittingReview(true);
                        setReviewError("");
                        try {
                          const res = await recipeAPI.addReview(liveRecipe._id, reviewForm);
                          if (res.data.success) {
                            setLiveRecipe(res.data.data);
                            const reviewsRes = await recipeAPI.getReviews(liveRecipe._id);
                            if (reviewsRes.data.success) setReviewsData(reviewsRes.data.data);
                          }
                        } catch (err) {
                          setReviewError(err.response?.data?.message || "Failed to submit review");
                        } finally {
                          setSubmittingReview(false);
                        }
                      }}
                      style={{ marginTop: "14px", display: "grid", gap: "12px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Your rating</div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {[1,2,3,4,5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "12px",
                                border: "1px solid var(--border-light)",
                                background: reviewForm.rating >= n ? "rgba(245, 158, 11, 0.12)" : "var(--white)",
                                color: reviewForm.rating >= n ? "#f59e0b" : "var(--text-muted)",
                                fontSize: "18px",
                                fontWeight: "900",
                                cursor: "pointer",
                                transition: "var(--transition)",
                              }}
                              aria-label={`Rate ${n} star`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "800", color: "var(--navy)" }}>
                          {reviewForm.rating}/5
                        </div>
                      </div>

                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                        placeholder="Write a helpful comment (optional)…"
                        rows={4}
                        style={{
                          width: "100%",
                          borderRadius: "14px",
                          border: "1px solid var(--border-light)",
                          padding: "12px 14px",
                          background: "var(--white)",
                          outline: "none",
                          fontSize: "14px",
                          resize: "vertical",
                        }}
                      />

                      {reviewError && (
                        <div style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700" }}>
                          {reviewError}
                        </div>
                      )}

                      <button className="btn-primary" type="submit" disabled={submittingReview} style={{ justifyContent: "center" }}>
                        {submittingReview ? "Submitting..." : myExistingReview ? "Update Review" : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Review list */}
                <div style={{ display: "grid", gap: "12px" }}>
                  {(reviewsData.reviewList || []).length === 0 ? (
                    <div style={{ padding: "18px", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-light)", color: "var(--text-muted)", background: "var(--white)" }}>
                      No reviews yet. Be the first to review this recipe.
                    </div>
                  ) : (
                    (reviewsData.reviewList || []).map((r, idx) => (
                      <div key={idx} style={{ background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "12px", overflow: "hidden", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "var(--primary)" }}>
                              {r.avatar ? (
                                <img src={getImageUrl(r.avatar)} alt={r.name || "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                (r.name || "U")[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: "900", color: "var(--navy)" }}>{r.name || "User"}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "900", color: "#f59e0b" }}>
                            {"★".repeat(Math.max(0, Math.min(5, r.rating || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, r.rating || 0)))}
                            <span style={{ color: "var(--text-main)", fontSize: "13px", fontWeight: "800", marginLeft: "6px" }}>{r.rating}/5</span>
                          </div>
                        </div>
                        {r.comment ? (
                          <div style={{ marginTop: "10px", fontSize: "14px", color: "var(--text-main)", lineHeight: "1.6" }}>
                            {r.comment}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
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
                  { icon: "⏱️", label: "Prep Time", val: liveRecipe.prepTime },
                  { icon: "🔥", label: "Cook Time", val: liveRecipe.cookTime },
                  { icon: "👥", label: "Servings", val: liveRecipe.servings },
                  { icon: "⚡", label: "Calories", val: liveRecipe.calories },
                  { icon: "📈", label: "Difficulty", val: liveRecipe.difficulty },
                  { icon: "🌍", label: "Cuisine", val: liveRecipe.cuisine }
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

            {liveRecipe.tip && (
              <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fff 100%)", borderRadius: "var(--radius-lg)", border: "1px solid #fed7aa", padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c2410c", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  💡 Chef's Secret Tip
                </div>
                <p style={{ fontSize: "14px", color: "#7c2d12", lineHeight: "1.6", fontWeight: "500", fontStyle: "italic" }}>
                  "{liveRecipe.tip}"
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

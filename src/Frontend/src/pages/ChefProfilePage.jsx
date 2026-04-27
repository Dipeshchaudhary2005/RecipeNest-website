import { useState, useEffect, useCallback } from "react";
import { recipeAPI, userAPI, getImageUrl } from "../services/api";
import RecipeCard from "../components/RecipeCard";

export default function ChefProfilePage({
  chefId,
  setPage,
  setSelectedRecipe,
  user,
  setUser
}) {
  const [chef, setChef] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // FIXED: fetchChefData moved above useEffect
  const fetchChefData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [chefRes, recipesRes] = await Promise.all([
        userAPI.getProfile(chefId),
        recipeAPI.getAll({
          chef: chefId,
          status: "Live"
        })
      ]);

      if (chefRes.data.success) {
        setChef(chefRes.data.data.user);
      }

      if (recipesRes.data.success) {
        const data = recipesRes.data.data;
        setRecipes(
          Array.isArray(data)
            ? data
            : data.recipes || []
        );
      }
    } catch (err) {
      console.error("Error fetching chef profile:", err);
      setError("Failed to load chef profile.");
    } finally {
      setLoading(false);
    }
  }, [chefId]);

  useEffect(() => {
    fetchChefData();
  }, [fetchChefData]);

  useEffect(() => {
    if (user && chef) {
      setIsFollowing(
        user.following?.some(
          (f) => (f._id || f) === chef._id
        )
      );
    }
  }, [user, chef]);

  const handleFollow = async () => {
    if (!user) {
      setPage("login");
      return;
    }

    if (followLoading) return;

    setFollowLoading(true);

    try {
      const res = isFollowing
        ? await userAPI.unfollowChef(chefId)
        : await userAPI.followChef(chefId);

      if (res.data.success) {
        setIsFollowing(!isFollowing);
        setUser(res.data.data.user);

        // update local chef stats
        setChef((prev) => ({
          ...prev,
          followersCount: isFollowing
            ? (prev.followersCount || 0) - 1
            : (prev.followersCount || 0) + 1
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)"
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: "20px"
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "20px"
          }}
        >
          😕
        </div>

        <h2
          style={{
            color: "var(--navy)",
            fontWeight: "800"
          }}
        >
          {error || "Chef not found"}
        </h2>

        <button
          className="btn-primary"
          onClick={() => setPage("home")}
          style={{
            marginTop: "24px"
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "120px 24px 60px"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        {/* Profile Header Card */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "32px",
            padding: "40px",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-light)",
            marginBottom: "60px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Background Decoration */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(255, 49, 49, 0.05) 0%, transparent 70%)",
              zIndex: 0
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1
            }}
          >
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "48px",
                overflow: "hidden",
                background: "var(--primary)",
                border: "6px solid var(--bg)",
                boxShadow: "var(--shadow-md)"
              }}
            >
              {chef.avatar ? (
                <img
                  src={getImageUrl(chef.avatar)}
                  alt={chef.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    color: "#fff",
                    fontWeight: "900"
                  }}
                >
                  {chef.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "300px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "16px"
                }}
              >
                <div>
                  <h1
                    className="serif"
                    style={{
                      fontSize: "36px",
                      fontWeight: "900",
                      color: "var(--navy)",
                      marginBottom: "4px"
                    }}
                  >
                    {chef.name}
                  </h1>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "var(--primary)",
                      fontWeight: "700"
                    }}
                  >
                    Professional Chef
                  </p>
                </div>

                {user?._id !== chef._id && (
                  <button
                    onClick={handleFollow}
                    className={
                      isFollowing
                        ? "btn-secondary"
                        : "btn-primary"
                    }
                    style={{
                      padding: "12px 32px",
                      borderRadius: "16px",
                      minWidth: "140px"
                    }}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? "..."
                      : isFollowing
                      ? "Following"
                      : "Follow Chef"}
                  </button>
                )}
              </div>

              <p
                style={{
                  color: "var(--text-main)",
                  fontSize: "15px",
                  lineHeight: "1.7",
                  marginBottom: "24px"
                }}
              >
                {chef.bio ||
                  "Crafting culinary experiences with passion and precision. Exploring flavors from around the globe."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  borderTop: "1px solid var(--border-light)",
                  paddingTop: "24px"
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "var(--navy)"
                    }}
                  >
                    {recipes.length}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "700",
                      textTransform: "uppercase"
                    }}
                  >
                    Recipes
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "var(--navy)"
                    }}
                  >
                    {chef.followers?.length || 0}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "700",
                      textTransform: "uppercase"
                    }}
                  >
                    Followers
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "var(--navy)"
                    }}
                  >
                    {chef.rating || "4.8"}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "700",
                      textTransform: "uppercase"
                    }}
                  >
                    Avg Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px"
            }}
          >
            <h2
              className="serif"
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "var(--navy)"
              }}
            >
              Chef's Feed
            </h2>

            <div
              style={{
                flex: 1,
                height: "2px",
                background: "var(--border-light)"
              }}
            />
          </div>

          {recipes.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "40px"
              }}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={{ ...recipe, chef }}
                  variant="feed"
                  user={user}
                  setUser={setUser}
                  setPage={setPage}
                  onClick={(r) => {
                    setSelectedRecipe(r);
                    setPage("recipe-detail");
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                background: "var(--white)",
                borderRadius: "24px",
                border: "1px dashed var(--border-light)"
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px"
                }}
              >
                🥣
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "var(--navy)"
                }}
              >
                No Recipes Published Yet
              </h3>

              <p
                style={{
                  color: "var(--text-muted)",
                  marginTop: "8px"
                }}
              >
                Stay tuned for some amazing culinary creations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
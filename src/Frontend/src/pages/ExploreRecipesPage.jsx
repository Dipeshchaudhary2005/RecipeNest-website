import { useState, useEffect } from "react";
import { recipeAPI } from "../services/api";
import RecipeCard from "../components/RecipeCard";

const SAMPLE_RECIPES = [
  {
    _id: "1",
    title: "Turmeric Lemon Chicken Bowl",
    description: "Juicy grilled chicken over herbed quinoa with a zesty lemon drizzle.",
    image: "https://images.unsplash.com/photo-1604908177520-e0f7b16367b9?auto=format&fit=crop&w=1000&q=80",
    chef: "Amina Patel",
    difficulty: "Easy",
    time: "35m",
    servings: 2,
    tag: "Healthy",
    tagColor: "#22c55e",
    rating: 4.8,
    reviews: 135,
    prepTime: "15 min",
    cookTime: "20 min",
    calories: "420 kcal",
    cuisine: "Mediterranean",
    ingredients: [
      { name: "Chicken breast", note: "2 pieces, cut into strips" },
      { name: "Turmeric", note: "1 tsp" },
      { name: "Lemon juice", note: "2 tbsp" },
      { name: "Quinoa", note: "1 cup cooked" },
      { name: "Olive oil", note: "1 tbsp" }
    ],
    steps: [
      { title: "Marinate chicken", body: "Mix chicken with turmeric, lemon juice, olive oil, salt, and pepper. Let sit 10 minutes.", hasImage: false },
      { title: "Cook quinoa", body: "Boil quinoa in salted water until fluffy, then fluff with fork.", hasImage: false },
      { title: "Grill chicken", body: "Pan-sear chicken for 6 min each side until golden and cooked through.", hasImage: false },
      { title: "Assemble bowl", body: "Divide quinoa, top with chicken and fresh herbs, drizzle lemon.", hasImage: false }
    ]
  },
  {
    _id: "2",
    title: "Spicy Sriracha Veggie Stir Fry",
    description: "Colorful vegetables stir fry with homemade spicy sriracha sauce.",
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1000&q=80",
    chef: "Kai Lee",
    difficulty: "Medium",
    time: "30m",
    servings: 3,
    tag: "Vegan",
    tagColor: "#f97316",
    rating: 4.7,
    reviews: 98,
    prepTime: "12 min",
    cookTime: "18 min",
    calories: "360 kcal",
    cuisine: "Asian",
    ingredients: [
      { name: "Broccoli", note: "1 cup florets" },
      { name: "Bell pepper", note: "1 red, sliced" },
      { name: "Sriracha", note: "2 tbsp" },
      { name: "Soy sauce", note: "2 tbsp" },
      { name: "Sesame oil", note: "1 tbsp" }
    ],
    steps: [
      { title: "Prep veggies", body: "Chop all vegetables evenly.", hasImage: false },
      { title: "Make sauce", body: "Whisk sriracha, soy, honey, and a touch of water.", hasImage: false },
      { title: "Stir fry", body: "Heat oil, cook veggies until tender-crisp, add sauce and toss.", hasImage: false },
      { title: "Serve", body: "Garnish with sesame and scallions over rice.", hasImage: false }
    ]
  },
  {
    _id: "3",
    title: "Chocolate Fig Overnight Oats",
    description: "Decadent, no-cook breakfast that’s ready in the morning with rich cocoa flavor.",
    image: "https://images.unsplash.com/photo-1505253213478-6e5ce779fddf?auto=format&fit=crop&w=1000&q=80",
    chef: "Nina Gómez",
    difficulty: "Easy",
    time: "10m",
    servings: 1,
    tag: "Breakfast",
    tagColor: "#eab308",
    rating: 4.9,
    reviews: 210,
    prepTime: "10 min",
    cookTime: "0 min",
    calories: "310 kcal",
    cuisine: "Global",
    ingredients: [
      { name: "Rolled oats", note: "1/2 cup" },
      { name: "Unsweetened cocoa", note: "1 tbsp" },
      { name: "Milk", note: "3/4 cup" },
      { name: "Maple syrup", note: "1 tbsp" },
      { name: "Dried figs", note: "2, chopped" }
    ],
    steps: [
      { title: "Mix base", body: "Combine oats, cocoa, milk, and maple syrup in jar.", hasImage: false },
      { title: "Add figs", body: "Stir in chopped figs, seal jar.", hasImage: false },
      { title: "Refrigerate", body: "Chill overnight.", hasImage: false },
      { title: "Finish", body: "Top with fresh berries before serving.", hasImage: false }
    ]
  }
];

export default function ExploreRecipesPage({ setPage, setSelectedRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const TABS = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    fetchRecipes();

    const onRecipeCreated = (event) => {
      const recipe = event.detail;
      if (recipe && recipe._id) {
        setRecipes(prev => [recipe, ...prev.filter(r => r._id !== recipe._id)]);
      }
    };

    window.addEventListener("recipe-created", onRecipeCreated);

    return () => {
      window.removeEventListener("recipe-created", onRecipeCreated);
    };
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setRecipes(response.data.data);
      } else {
        setRecipes(SAMPLE_RECIPES);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes(SAMPLE_RECIPES);
    } finally {
      setLoading(false);
    }
  };

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

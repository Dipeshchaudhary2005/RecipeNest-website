// ─── RECIPES ─────────────────────────────────────────────────────────────────
export const recipes = [
  {
    id: 1, title: "Perfect Grilled Ribeye Steak",
    description: "Juicy ribeye steak grilled to perfection with garlic butter and fresh garden herbs.",
    time: "25 minutes", prepTime: "10 mins", cookTime: "15 mins",
    servings: 2, calories: 680, difficulty: "Medium", cuisine: "American",
    tag: "Grilled", tagColor: "#e85d2f", chef: "Chef James Anderson",
    rating: 4.9, reviews: 703, updatedAgo: "2 days ago", status: "Live",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=380&fit=crop",
    stepImages: [
      "https://images.unsplash.com/photo-1611599538813-7a6e2a61b354?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=600&h=300&fit=crop",
    ],
    ingredients: [
      { name: "2 Ribeye Steaks", note: "1.5 inches thick, room temperature" },
      { name: "2 tbsp Olive Oil", note: "Extra virgin preferred" },
      { name: "4 cloves Garlic", note: "Crushed but whole" },
      { name: "3 tbsp Unsalted Butter", note: "High-quality grass-fed" },
      { name: "Fresh Rosemary & Thyme", note: "2 sprigs each" },
      { name: "Kosher Salt", note: "To taste" },
      { name: "Black Pepper", note: "Freshly cracked" },
    ],
    steps: [
      { title: "Preparation", body: "Remove the ribeye steaks from the refrigerator at least 30–45 minutes before cooking.", hasImage: true },
      { title: "Seasoning", body: "Season generously with kosher salt and freshly cracked black pepper on all sides.", hasImage: false },
      { title: "The Sear", body: "Heat a cast-iron skillet over high heat until smoking hot. Sear for 3–4 minutes.", hasImage: true },
      { title: "Butter Basting", body: "Flip the steaks. Add butter, garlic, and fresh herbs. Baste continuously for 2–3 minutes.", hasImage: false },
    ],
    tip: "Always let your steak rest for at least 10 minutes after grilling.",
  },
  {
    id: 2, title: "Fresh Garden Vegetable Medley",
    description: "Colorful roasted vegetables with herbs and a light balsamic reduction glaze.",
    time: "35 minutes", prepTime: "15 mins", cookTime: "20 mins",
    servings: 4, calories: 220, difficulty: "Easy", cuisine: "Mediterranean",
    tag: "Vegetarian", tagColor: "#3aab5e", chef: "Chef Emma Green",
    rating: 4.7, reviews: 412, updatedAgo: "5 hours ago", status: "Pending Review",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=380&fit=crop",
    stepImages: [], ingredients: [], steps: [], tip: "",
  },
  {
    id: 3, title: "Pan-Seared Salmon with Lemon",
    description: "Crispy-skinned salmon in a bright, zesty lemon butter sauce and garnish.",
    time: "17 minutes", prepTime: "5 mins", cookTime: "12 mins",
    servings: 2, calories: 420, difficulty: "Easy", cuisine: "French",
    tag: "Seafood", tagColor: "#1a7eb8", chef: "Chef Maria Santos",
    rating: 4.8, reviews: 289, updatedAgo: "Rejected yesterday", status: "Rejected",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=380&fit=crop",
    stepImages: [], ingredients: [], steps: [], tip: "",
  },
  {
    id: 4, title: "Classic Avocado Toast",
    description: "Perfectly ripe avocado on sourdough with a sprinkle of everything bagel seasoning.",
    time: "10 minutes", prepTime: "5 mins", cookTime: "5 mins",
    servings: 1, calories: 310, difficulty: "Easy", cuisine: "American",
    tag: "Vegetarian", tagColor: "#3aab5e", chef: "Chef Mario",
    rating: 4.5, reviews: 198, updatedAgo: "1 week ago", status: "Live",
    image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&h=380&fit=crop",
    stepImages: [], ingredients: [], steps: [], tip: "",
  },
  {
    id: 5, title: "Spicy Penne Arrabbiata",
    description: "Classic spicy Italian pasta with roasted garlic and fresh plum leaves.",
    time: "25 minutes", prepTime: "10 mins", cookTime: "15 mins",
    servings: 4, calories: 510, difficulty: "Medium", cuisine: "Italian",
    tag: "Italian", tagColor: "#c0392b", chef: "Chef Marco Polo",
    rating: 4.6, reviews: 325, updatedAgo: "3 days ago", status: "Live",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=380&fit=crop",
    stepImages: [], ingredients: [], steps: [], tip: "",
  },
  {
    id: 6, title: "Triple Chocolate Lava Cake",
    description: "Rich, decadent chocolate cake with a gooey molten center served with cream.",
    time: "45 minutes", prepTime: "20 mins", cookTime: "25 mins",
    servings: 6, calories: 780, difficulty: "Hard", cuisine: "French",
    tag: "Desserts", tagColor: "#8e44ad", chef: "Chef Sofia Rossi",
    rating: 4.9, reviews: 512, updatedAgo: "1 day ago", status: "Live",
    image: "https://images.unsplash.com/photo-1617305855058-336d24456869?w=600&h=380&fit=crop",
    stepImages: [], ingredients: [], steps: [], tip: "",
  },
];

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export const adminUsers = [
  { id: 1, name: "Marco Rossi", email: "marco.rossi@example.com", avatar: "MR", avatarBg: "#c0392b", role: "Chef", verification: "VERIFIED CHEF", verificationStatus: "verified", status: "Active", statusType: "active" },
  { id: 2, name: "Elena Smith", email: "elena.smith@mail.com", avatar: "ES", avatarBg: "#7f8c8d", role: "User", verification: "Not Applicable", verificationStatus: "na", status: "Suspended", statusType: "suspended" },
  { id: 3, name: "Aisha Kamal", email: "aisha.k@gourmet.io", avatar: "AK", avatarBg: "#e85d2f", role: "Chef", verification: "VERIFY CHEF APPLICATION", verificationStatus: "pending", status: "Pending", statusType: "pending" },
  { id: 4, name: "James Anderson", email: "james.a@recipe.com", avatar: "JA", avatarBg: "#2980b9", role: "Chef", verification: "VERIFIED CHEF", verificationStatus: "verified", status: "Active", statusType: "active" },
];

export const CATEGORIES = ["All Recipes", "Italian", "Asian", "Desserts", "Grilled", "Vegetarian", "Seafood"];
export const CAT_DOTS = { Italian:"#c0392b", Asian:"#e67e22", Desserts:"#8e44ad", Grilled:"#e85d2f", Vegetarian:"#3aab5e", Seafood:"#1a7eb8" };

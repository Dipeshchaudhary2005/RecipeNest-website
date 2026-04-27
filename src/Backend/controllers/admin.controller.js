const User = require("../models/user.models");
const Recipe = require("../models/recipe.models");

/**
 * Get platform statistics for Admin Dashboard
 * GET /api/admin/stats
 */
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, liveRecipes, pendingRecipes, totalChefs] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments({ status: "Live" }),
      Recipe.countDocuments({ status: "Pending Review" }),
      User.countDocuments({ role: "chef" })
    ]);

    // New Chefs (joined in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newChefs = await User.countDocuments({ 
      role: "chef", 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Real Engagement (Total Favorites + Total Reviews)
    const [favoritesCountAgg, reviewsCountAgg] = await Promise.all([
      User.aggregate([
        { $project: { favoritesCount: { $size: "$favorites" } } },
        { $group: { _id: null, total: { $sum: "$favoritesCount" } } }
      ]),
      Recipe.aggregate([
        { $project: { reviewsCount: { $size: "$reviewList" } } },
        { $group: { _id: null, total: { $sum: "$reviewsCount" } } }
      ])
    ]);

    const totalFavorites = favoritesCountAgg?.[0]?.total || 0;
    const totalReviews = reviewsCountAgg?.[0]?.total || 0;
    
    // Engagement Score (arbitrary formula for demonstration: (favs*2 + reviews*3) / totalUsers)
    const engagementScore = totalUsers > 0 
      ? Math.min(100, Math.round(((totalFavorites * 2) + (totalReviews * 3)) / (totalUsers * 0.5)))
      : 0;

    // Recent Recipes (latest 5 across all statuses)
    const recentRecipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("chef", "name avatar")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalRecipes: liveRecipes,
        totalUsers,
        newChefs,
        pendingRecipes,
        engagement: engagementScore || 0,
        recentRecipes: recentRecipes.map(r => ({
          id: r._id,
          title: r.title,
          chef: r.chef?.name || "Unknown",
          status: r.status,
          createdAt: r.createdAt
        }))
      },
      message: "Admin statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    handleError(res, error);
  }
};

/**
 * Approve a pending recipe
 * PUT /api/admin/recipes/:id/approve
 */
const approveRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: "Live", rejectionReason: "" },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.status(200).json({
      success: true,
      data: recipe,
      message: "Recipe approved successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve recipe" });
  }
};

/**
 * Reject a pending recipe
 * PUT /api/admin/recipes/:id/reject
 */
const rejectRecipe = async (req, res) => {
  try {
    const { reason } = req.body;
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", rejectionReason: reason || "Does not meet guidelines" },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.status(200).json({
      success: true,
      data: recipe,
      message: "Recipe rejected successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject recipe" });
  }
};

module.exports = {
  getAdminStats,
  approveRecipe,
  rejectRecipe
};

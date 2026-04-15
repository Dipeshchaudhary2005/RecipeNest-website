const User = require("../models/user.models");
const Recipe = require("../models/recipe.models");

/**
 * Get platform statistics for Admin Dashboard
 * GET /api/admin/stats
 */
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments({ status: "Live" });
    const pendingRecipes = await Recipe.countDocuments({ status: "Pending Review" });
    const totalChefs = await User.countDocuments({ role: "chef" });

    // New Chefs (joined in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newChefs = await User.countDocuments({ 
      role: "chef", 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecipes,
        totalUsers,
        newChefs,
        pendingRecipes,
        engagement: 92 // Static realistic for now
      },
      message: "Admin statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

/**
 * GET /api/admin/stats
 * Get platform statistics
 * Access: Admin only
 */
router.get("/stats", protect, adminOnly, adminController.getAdminStats);

/**
 * PUT /api/admin/recipes/:id/approve
 * Approve a pending recipe
 */
router.put("/recipes/:id/approve", protect, adminOnly, adminController.approveRecipe);

/**
 * PUT /api/admin/recipes/:id/reject
 * Reject a pending recipe
 */
router.put("/recipes/:id/reject", protect, adminOnly, adminController.rejectRecipe);

module.exports = router;

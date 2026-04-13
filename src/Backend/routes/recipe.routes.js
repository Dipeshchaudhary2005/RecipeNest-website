/**
 * Recipe Routes
 *
 * This file defines all API endpoints related to recipes.
 * Routes are organized by functionality and protected with appropriate middleware.
 *
 * Authentication Levels:
 * - Public: Anyone can access
 * - Authenticated: Only logged-in users
 * - Chef/Admin: Only chefs and admins
 * - Owner/Admin: Only recipe chef or admin
 */

const express = require("express");
const router = express.Router();

// Import controllers
const recipeController = require("../controllers/recipe.controller");

// Import middleware
const { protect } = require("../middleware/auth.middleware");
const { uploadRecipeImage } = require("../config/multer.config");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /api/recipes
 * Get all recipes with pagination, filtering, and search
 * Query params: page, limit, tag, difficulty, search, sort
 */
router.get("/", recipeController.getAllRecipes);

/**
 * GET /api/recipes/search
 * Search recipes
 * Query params: q, tag, difficulty, page, limit
 */
router.get("/search", recipeController.searchRecipes);

/**
 * GET /api/recipes/:id
 * Get a single recipe by ID
 */
router.get("/:id", recipeController.getRecipeById);

/**
 * GET /api/recipes/chef/:chefId
 * Get all recipes by a specific chef
 */
router.get("/chef/:chefId", recipeController.getRecipesByChef);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * GET /api/recipes/my-recipes
 * Get recipes for the logged-in chef
 * Requires authentication
 */
router.get("/my-recipes", protect, recipeController.getMyRecipes);

/**
 * POST /api/recipes
 * Create a new recipe
 * Requires authentication
 */
router.post("/", protect, uploadRecipeImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'stepImages', maxCount: 10 }
]), recipeController.createRecipe);

/**
 * PUT /api/recipes/:id
 * Update an existing recipe
 * Requires authentication and ownership
 */
router.put("/:id", protect, uploadRecipeImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'stepImages', maxCount: 10 }
]), recipeController.updateRecipe);

/**
 * DELETE /api/recipes/:id
 * Delete a recipe
 * Requires authentication and ownership
 */
router.delete("/:id", protect, recipeController.deleteRecipe);

module.exports = router;
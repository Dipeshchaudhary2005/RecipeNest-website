/**
 * Recipe Controller
 *
 * This controller handles HTTP requests related to recipes.
 * It receives requests from routes, validates input, calls services,
 * and returns appropriate HTTP responses.
 *
 * Each controller function:
 * 1. Validates request data
 * 2. Calls the appropriate service function
 * 3. Returns success response or handles errors
 */

const recipeService = require("../services/recipe.service");
const { NODE_ENV } = require("../config/config");

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate recipe creation/update data
 * @param {Object} data - Request body data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Array} Array of error messages
 */
const validateRecipeData = (data, isUpdate = false) => {
  const errors = [];

  // Title validation (required for create, optional for update)
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("Title is required and must be a non-empty string");
    } else if (data.title.length > 100) {
      errors.push("Title cannot be more than 100 characters");
    }
  }

  // Description validation
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
      errors.push("Description is required and must be a non-empty string");
    } else if (data.description.length > 1000) {
      errors.push("Description cannot be more than 1000 characters");
    }
  }

  // Chef validation
  if (!isUpdate || data.chef !== undefined) {
    if (!data.chef) {
      errors.push("Chef is required");
    }
  }

  // Servings validation
  if (data.servings !== undefined) {
    if (typeof data.servings !== "number" || data.servings < 1) {
      errors.push("Servings must be a number greater than 0");
    }
  }

  // Calories validation
  if (data.calories !== undefined) {
    if (typeof data.calories !== "number" || data.calories < 0) {
      errors.push("Calories must be a non-negative number");
    }
  }

  // Difficulty validation
  if (data.difficulty !== undefined) {
    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(data.difficulty)) {
      errors.push("Difficulty must be one of: Easy, Medium, Hard");
    }
  }

  // Status validation
  if (data.status !== undefined) {
    const validStatuses = ["Live", "Pending Review", "Rejected", "Draft"];
    if (!validStatuses.includes(data.status)) {
      errors.push("Status must be one of: Live, Pending Review, Rejected, Draft");
    }
  }

  // Rating validation
  if (data.rating !== undefined) {
    if (typeof data.rating !== "number" || data.rating < 0 || data.rating > 5) {
      errors.push("Rating must be a number between 0 and 5");
    }
  }

  // Reviews validation
  if (data.reviews !== undefined) {
    if (typeof data.reviews !== "number" || data.reviews < 0) {
      errors.push("Reviews must be a non-negative number");
    }
  }

  return errors;
};

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * Get all recipes with pagination and filtering
 * GET /api/recipes
 */
const getAllRecipes = async (req, res) => {
  try {
    const result = await recipeService.getAllRecipes(req.query);
    res.status(200).json({
      success: true,
      data: result.recipes,
      pagination: result.pagination,
      message: "Recipes retrieved successfully",
    });
  } catch (error) {
    console.error("Get all recipes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recipes",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get a single recipe by ID
 * GET /api/recipes/:id
 */
const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }
    res.status(200).json({
      success: true,
      data: recipe,
      message: "Recipe retrieved successfully",
    });
  } catch (error) {
    console.error("Get recipe by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recipe",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create a new recipe
 * POST /api/recipes
 */
const createRecipe = async (req, res) => {
  try {
    // 1. Prepare data (cast numbers and parse JSON)
    const rawData = { 
      ...req.body,
      chef: req.user._id, // Add chef BEFORE validation
      status: req.user.role === 'admin' ? (req.body.status || 'Live') : 'Pending Review', // Default to Pending Review for chefs
    };
    
    // Cast numeric fields
    if (rawData.servings) rawData.servings = Number(rawData.servings);
    if (rawData.calories) rawData.calories = Number(rawData.calories);
    if (rawData.rating) rawData.rating = Number(rawData.rating);
    if (rawData.reviews) rawData.reviews = Number(rawData.reviews);
    
    // Parse JSON fields
    if (typeof rawData.ingredients === "string") {
      try { rawData.ingredients = JSON.parse(rawData.ingredients); } catch (e) { /* ignore */ }
    }
    if (typeof rawData.steps === "string") {
      try { rawData.steps = JSON.parse(rawData.steps); } catch (e) { /* ignore */ }
    }

    // 2. Validate input data
    const validationErrors = validateRecipeData(rawData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const recipe = await recipeService.createRecipe(rawData, req.files);
    res.status(201).json({
      success: true,
      data: recipe,
      message: "Recipe created successfully",
    });
  } catch (error) {
    console.error("Create recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create recipe",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update an existing recipe
 * PUT /api/recipes/:id
 */
const updateRecipe = async (req, res) => {
  try {
    // 1. Prepare data (cast numbers and parse JSON)
    const rawData = { ...req.body };
    
    // Cast numeric fields
    if (rawData.servings) rawData.servings = Number(rawData.servings);
    if (rawData.calories) rawData.calories = Number(rawData.calories);
    if (rawData.rating) rawData.rating = Number(rawData.rating);
    if (rawData.reviews) rawData.reviews = Number(rawData.reviews);
    
    // Parse JSON fields (optional because the frontend should send them as part of the body, but sometimes multipart sends as JSON string)
    if (typeof rawData.ingredients === "string") {
      try { rawData.ingredients = JSON.parse(rawData.ingredients); } catch (e) { /* ignore */ }
    }
    if (typeof rawData.steps === "string") {
      try { rawData.steps = JSON.parse(rawData.steps); } catch (e) { /* ignore */ }
    }

    // 2. Validate input data
    const validationErrors = validateRecipeData(rawData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const recipe = await recipeService.updateRecipe(req.params.id, rawData, req.files, req.user._id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }
    res.status(200).json({
      success: true,
      data: recipe,
      message: "Recipe updated successfully",
    });
  } catch (error) {
    console.error("Update recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recipe",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a recipe
 * DELETE /api/recipes/:id
 */
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.deleteRecipe(req.params.id, req.user._id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recipe",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get recipes by chef
 * GET /api/recipes/chef/:chefId
 */
const getRecipesByChef = async (req, res) => {
  try {
    const result = await recipeService.getRecipesByChef(req.params.chefId, req.query);
    res.status(200).json({
      success: true,
      data: result.recipes,
      pagination: result.pagination,
      message: "Recipes retrieved successfully",
    });
  } catch (error) {
    console.error("Get recipes by chef error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recipes",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Search recipes
 * GET /api/recipes/search
 */
const searchRecipes = async (req, res) => {
  try {
    const result = await recipeService.searchRecipes(req.query);
    res.status(200).json({
      success: true,
      data: result.recipes,
      pagination: result.pagination,
      message: "Search completed successfully",
    });
  } catch (error) {
    console.error("Search recipes error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get recipes for the logged-in chef
 * GET /api/recipes/my-recipes
 */
const getMyRecipes = async (req, res) => {
  try {
    const result = await recipeService.getMyRecipes(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.recipes,
      pagination: result.pagination,
      message: "Your recipes retrieved successfully",
    });
  } catch (error) {
    console.error("Get my recipes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your recipes",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByChef,
  searchRecipes,
  getMyRecipes,
};
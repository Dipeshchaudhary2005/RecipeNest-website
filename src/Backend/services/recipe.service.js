/**
 * Recipe Service
 *
 * This service handles all business logic related to recipes.
 * It communicates with the Recipe model and handles CRUD operations.
 *
 * Each function follows this pattern:
 * 1. Validate input data
 * 2. Perform database operations
 * 3. Return formatted response
 * 4. Handle errors gracefully
 */

const Recipe = require("../models/recipe.models");
const User = require("../models/user.models");
const { deleteOldFile, getFileUrl } = require("../config/multer.config");

/**
 * Get all recipes with pagination and filtering
 * @param {Object} query - Query parameters
 * @returns {Object} Paginated list of recipes
 */
const getAllRecipes = async (query = {}) => {
  try {
    // Set default pagination values
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: query.status || "Live" }; // Default to live recipes if no status provided

    if (query.tag) {
      filter.tag = query.tag;
    }

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Build sort object
    let sort = { createdAt: -1 }; // Default sort by newest
    if (query.sort === "rating") {
      sort = { rating: -1 };
    } else if (query.sort === "title") {
      sort = { title: 1 };
    }

    // Execute query
    const recipes = await Recipe.find(filter)
      .populate("chef", "name email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get all recipes error:", error);
    throw new Error("Failed to retrieve recipes");
  }
};

/**
 * Get a single recipe by ID
 * @param {String} id - Recipe ID
 * @returns {Object} Recipe data
 */
const getRecipeById = async (id) => {
  try {
    const recipe = await Recipe.findById(id)
      .populate("chef", "name email avatar")
      .lean();

    if (!recipe) {
      return null;
    }

    return recipe;
  } catch (error) {
    console.error("Get recipe by ID error:", error);
    throw new Error("Failed to retrieve recipe");
  }
};

/**
 * Create a new recipe
 * @param {Object} recipeData - Recipe data
 * @param {Array} files - Uploaded files
 * @returns {Object} Created recipe
 */
const createRecipe = async (recipeData, files) => {
  try {
    // Handle file uploads
    if (files && files.image && files.image[0]) {
      recipeData.image = getFileUrl(files.image[0].filename, "recipe");
    }

    if (files && files.stepImages) {
      recipeData.stepImages = files.stepImages.map(file => getFileUrl(file.filename, "recipe"));
    }

    // Create recipe
    const recipe = new Recipe(recipeData);
    await recipe.save();

    return await Recipe.findById(recipe._id).populate("chef", "name email avatar");
  } catch (error) {
    console.error("Create recipe error:", error);
    throw new Error("Failed to create recipe");
  }
};

/**
 * Update an existing recipe
 * @param {String} id - Recipe ID
 * @param {Object} updateData - Update data
 * @param {Array} files - Uploaded files
 * @param {String} userId - User ID (for authorization)
 * @returns {Object} Updated recipe
 */
const updateRecipe = async (id, updateData, files, userId) => {
  try {
    // Check if recipe exists and user is authorized
    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      return null;
    }

    if (existingRecipe.chef.toString() !== userId) {
      throw new Error("Unauthorized to update this recipe");
    }

    // Handle file uploads
    if (files && files.image && files.image[0]) {
      // Delete old image if exists
      if (existingRecipe.image) {
        await deleteOldFile(existingRecipe.image, "recipe");
      }
      updateData.image = getFileUrl(files.image[0].filename, "recipe");
    }

    if (files && files.stepImages) {
      // Delete old step images
      if (existingRecipe.stepImages && existingRecipe.stepImages.length > 0) {
        for (const image of existingRecipe.stepImages) {
          await deleteOldFile(image, "recipe");
        }
      }
      updateData.stepImages = files.stepImages.map(file => getFileUrl(file.filename, "recipe"));
    }

    // Update recipe
    const recipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("chef", "name email avatar");

    return recipe;
  } catch (error) {
    console.error("Update recipe error:", error);
    throw new Error("Failed to update recipe");
  }
};

/**
 * Delete a recipe
 * @param {String} id - Recipe ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Object} Deleted recipe
 */
const deleteRecipe = async (id, userId) => {
  try {
    // Check if recipe exists and user is authorized
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return null;
    }

    if (recipe.chef.toString() !== userId) {
      throw new Error("Unauthorized to delete this recipe");
    }

    // Delete associated files
    if (recipe.image) {
      await deleteOldFile(recipe.image, "recipe");
    }

    if (recipe.stepImages && recipe.stepImages.length > 0) {
      for (const image of recipe.stepImages) {
        await deleteOldFile(image, "recipe");
      }
    }

    // Delete recipe
    await Recipe.findByIdAndDelete(id);
    return recipe;
  } catch (error) {
    console.error("Delete recipe error:", error);
    throw new Error("Failed to delete recipe");
  }
};

/**
 * Get recipes by chef
 * @param {String} chefId - Chef ID
 * @param {Object} query - Query parameters
 * @returns {Object} Paginated list of recipes
 */
const getRecipesByChef = async (chefId, query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { chef: chefId };

    const recipes = await Recipe.find(filter)
      .populate("chef", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get recipes by chef error:", error);
    throw new Error("Failed to retrieve recipes");
  }
};

/**
 * Search recipes
 * @param {Object} query - Search parameters
 * @returns {Object} Search results
 */
const searchRecipes = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = query.q || query.search || "";
    const filter = { status: "Live" };

    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }

    if (query.tag) {
      filter.tag = query.tag;
    }

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    const recipes = await Recipe.find(filter)
      .populate("chef", "name email avatar")
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Search recipes error:", error);
    throw new Error("Search failed");
  }
};

/**
 * Get recipes for the logged-in chef (includes all statuses)
 * @param {String} chefId - Chef ID
 * @param {Object} query - Query parameters
 * @returns {Object} Paginated list of recipes
 */
const getMyRecipes = async (chefId, query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { chef: chefId };

    const recipes = await Recipe.find(filter)
      .populate("chef", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get my recipes error:", error);
    throw new Error("Failed to retrieve your recipes");
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByChef,
  getMyRecipes,
  searchRecipes,
};
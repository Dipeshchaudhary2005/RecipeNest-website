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
const mongoose = require("mongoose");

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
    // If status is provided, use it. Otherwise default to "Live".
    // Special case: if status is "All" (for admins), don't filter by status.
    const filter = {};
    if (query.status && query.status !== "All") {
      filter.status = query.status;
    } else if (!query.status) {
      filter.status = "Live";
    }

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

const recalcRecipeRating = (reviewList = []) => {
  const count = reviewList.length;
  const avg =
    count === 0
      ? 0
      : reviewList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;
  return {
    reviews: count,
    rating: Number(avg.toFixed(2)),
  };
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
    const recipe = new Recipe({
      ...recipeData,
      status: recipeData.status || "Pending Review" // Default to Pending Review for new recipes
    });
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
 * @param {Object} user - User (for authorization)
 * @returns {Object} Updated recipe
 */
const updateRecipe = async (id, updateData, files, user) => {
  try {
    // Check if recipe exists and user is authorized
    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      return null;
    }

    const userId = user?._id?.toString?.() || user?._id || user;
    const isAdmin = user?.role === "admin";
    if (!isAdmin && existingRecipe.chef.toString() !== userId) {
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
const deleteRecipe = async (id, user) => {
  try {
    // Check if recipe exists
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return null;
    }

    // Check authorization: Owner or Admin
    const userId = user?._id?.toString?.() || user?._id || user;
    const isAdmin = user?.role === "admin";
    
    if (!isAdmin && recipe.chef.toString() !== userId) {
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
    throw error; // Re-throw original error (e.g., "Unauthorized...")
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

/**
 * Get stats for a chef's creations.
 * - total recipes and status breakdown
 * - average rating
 * - total "saves" (favorites count across users)
 * - recent creations
 */
const getChefStats = async (chefId) => {
  try {
    const [counts, avgRatingAgg, recent] = await Promise.all([
      Recipe.aggregate([
        { $match: { chef: chefId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Recipe.aggregate([
        { $match: { chef: chefId } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
      Recipe.find({ chef: chefId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id title image status createdAt rating reviews")
        .lean(),
    ]);

    const statusCounts = counts.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const totalRecipes = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const avgRating = Number((avgRatingAgg?.[0]?.avg || 0).toFixed(2));

    // "Saves" = total number of times any of this chef's recipes appear in user favorites.
    const recipeIds = recent.map((r) => r._id);
    // If no recent recipes, still need full list of recipeIds to count favorites.
    // Avoid pulling all docs unless needed.
    const allRecipeIds =
      recipeIds.length > 0
        ? recipeIds
        : (await Recipe.find({ chef: chefId }).select("_id").lean()).map((r) => r._id);

    let totalSaves = 0;
    if (allRecipeIds.length > 0) {
      const savesAgg = await User.aggregate([
        { $unwind: "$favorites" },
        { $match: { favorites: { $in: allRecipeIds } } },
        { $count: "total" },
      ]);
      totalSaves = savesAgg?.[0]?.total || 0;
    }

    // Lightweight "engagement score" (0-100) derived from saves and published content.
    // Not a perfect metric, but it's real + stable without needing extra tracking tables.
    const liveCount = statusCounts["Live"] || 0;
    const engagementScore = Math.min(100, Math.round((totalSaves * 2 + liveCount * 5) / 2));

    return {
      totalRecipes,
      statusCounts: {
        Live: statusCounts["Live"] || 0,
        "Pending Review": statusCounts["Pending Review"] || 0,
        Rejected: statusCounts["Rejected"] || 0,
        Draft: statusCounts["Draft"] || 0,
      },
      avgRating,
      totalSaves,
      engagementScore,
      recent,
    };
  } catch (error) {
    console.error("Get chef stats error:", error);
    throw new Error("Failed to retrieve chef stats");
  }
};

/**
 * Add or update a user's review for a recipe
 */
const addOrUpdateReview = async ({ recipeId, user, rating, comment }) => {
  if (!recipeId) throw new Error("Recipe ID is required");
  if (!mongoose.Types.ObjectId.isValid(recipeId)) throw new Error("Invalid recipe id");
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error("Recipe not found");

  const userId = user?._id?.toString?.() || user?._id;
  if (!userId) throw new Error("User not found");

  const existingIndex = (recipe.reviewList || []).findIndex(
    (r) => r.user?.toString?.() === userId.toString()
  );

  const payload = {
    user: userId,
    name: user?.name || "",
    avatar: user?.avatar || null,
    rating: numericRating,
    comment: (comment || "").toString().trim(),
    updatedAt: new Date(),
  };

  if (existingIndex >= 0) {
    recipe.reviewList[existingIndex] = {
      ...recipe.reviewList[existingIndex].toObject?.() ?? recipe.reviewList[existingIndex],
      ...payload,
    };
  } else {
    recipe.reviewList = recipe.reviewList || [];
    recipe.reviewList.unshift({
      ...payload,
      createdAt: new Date(),
    });
  }

  const aggregates = recalcRecipeRating(recipe.reviewList);
  recipe.rating = aggregates.rating;
  recipe.reviews = aggregates.reviews;

  await recipe.save();

  return await Recipe.findById(recipeId)
    .populate("chef", "name email avatar")
    .lean();
};

/**
 * Get reviews for a recipe (newest first)
 */
const getRecipeReviews = async (recipeId) => {
  if (!mongoose.Types.ObjectId.isValid(recipeId)) throw new Error("Invalid recipe id");
  const recipe = await Recipe.findById(recipeId)
    .select("reviewList rating reviews")
    .lean();
  if (!recipe) throw new Error("Recipe not found");

  const list = (recipe.reviewList || []).slice().sort((a, b) => {
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bt - at;
  });

  return {
    rating: recipe.rating || 0,
    reviews: recipe.reviews || 0,
    reviewList: list,
  };
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
  getChefStats,
  addOrUpdateReview,
  getRecipeReviews,
};
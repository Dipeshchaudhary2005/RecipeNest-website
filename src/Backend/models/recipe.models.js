/**
 * Recipe Model
 *
 * This model defines the structure of a Recipe in the database.
 * A recipe represents a cooking instruction with ingredients and steps.
 */

const mongoose = require("mongoose");

// Sub-schema for recipe ingredients
const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ingredient name is required"],
    trim: true,
  },
  note: {
    type: String,
    trim: true,
    default: "",
  },
});

// Sub-schema for recipe steps
const StepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Step title is required"],
    trim: true,
  },
  body: {
    type: String,
    required: [true, "Step description is required"],
    trim: true,
  },
  hasImage: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

// Main Recipe Schema
const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a recipe title"],
      trim: true,
      maxlength: [100, "Recipe title cannot be more than 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Please provide a recipe description"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },

    // Reference to the chef (User model)
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a chef"],
    },

    // Recipe image
    image: {
      type: String,
      default: null, // URL to the uploaded image
    },

    // Step images (array of URLs)
    stepImages: [{
      type: String,
    }],

    // Cooking times
    prepTime: {
      type: String,
      default: "",
    },

    cookTime: {
      type: String,
      default: "",
    },

    totalTime: {
      type: String,
      default: "",
    },

    // Servings and nutrition
    servings: {
      type: Number,
      min: [1, "Servings must be at least 1"],
      default: 1,
    },

    calories: {
      type: Number,
      min: [0, "Calories cannot be negative"],
      default: 0,
    },

    // Difficulty level
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    // Cuisine type
    cuisine: {
      type: String,
      trim: true,
      default: "",
    },

    // Recipe category/tag
    tag: {
      type: String,
      trim: true,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["Live", "Pending Review", "Rejected", "Draft"],
      default: "Draft",
    },

    // Rating and reviews
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },

    reviews: {
      type: Number,
      min: [0, "Reviews cannot be negative"],
      default: 0,
    },

    // Ingredients
    ingredients: [IngredientSchema],

    // Steps
    steps: [StepSchema],

    // Cooking tip
    tip: {
      type: String,
      trim: true,
      default: "",
    },

    // Tags for search
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for search functionality
RecipeSchema.index({ title: "text", description: "text", tags: "text" });

// Index for filtering by tag
RecipeSchema.index({ tag: 1, status: 1 });

// Index for filtering by difficulty
RecipeSchema.index({ difficulty: 1 });

// Virtual field to get chef info (populated when queried)
RecipeSchema.virtual("chefInfo", {
  ref: "User",
  localField: "chef",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
RecipeSchema.set("toJSON", { virtuals: true });
RecipeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Recipe", RecipeSchema);
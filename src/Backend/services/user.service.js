const User = require("../models/user.models");
const Recipe = require("../models/recipe.models");
const jwt = require("jsonwebtoken");
const { deleteOldFile, getFileUrl } = require("../config/multer.config");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/config");
const emailService = require("./email.service");

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const pushNotification = async (targetUserId, notification) => {
  if (!targetUserId) return;
  try {
    await User.findByIdAndUpdate(
      targetUserId,
      {
        $push: {
          notifications: {
            $each: [{ ...notification, createdAt: new Date(), read: false }],
            $position: 0,
            $slice: 100,
          },
        },
      },
      { new: false }
    );
  } catch (e) {
    // Non-blocking
    console.warn("Notification push failed:", e.message);
  }
};

const registerUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new Error("User already exists with this email");
      error.statusCode = 400;
      console.error("Error in registerUser:", error);
      throw error;
    }

    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    });

    await user.save();

    return {
      success: true,
      message: "User registered successfully",
      data: { user },
    };
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    // Default Admin Bypass for development
    if (email === "admin" && password === "admin") {
      const adminUser = {
        _id: "admin-id",
        name: "System Admin",
        email: "admin",
        role: "admin",
        isActive: true,
      };
      const token = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });
      return {
        success: true,
        message: "Admin Login successful",
        data: {
          user: adminUser,
          token,
        },
      };
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Your account has been deactivated");
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = user.generateToken();
    const userObject = user.toObject();
    delete userObject.password;

    return {
      success: true,
      message: "Login successful",
      data: { user: userObject, token },
    };
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    throw error;
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select("-password")
      .populate("following", "name avatar email role")
      .populate("favorites", "title image chef difficulty time");
    
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, data: { user } };
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    throw error;
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedUpdates = ["name", "phone", "address", "avatar", "bio", "specialty"];
    const filteredData = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      message: "Profile updated successfully",
      data: { user },
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error.message);
    throw error;
  }
};

const getAllUsers = async (options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const query = options.includeInactive ? {} : { isActive: true };

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    throw error;
  }
};

const sendPasswordResetCode = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email address not found");
      error.statusCode = 404;
      throw error;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = code;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save({ validateBeforeSave: false });

    // Actually send the email
    await emailService.sendResetPasswordEmail(user.email, code).catch(err => {
      console.error("Non-blocking email error:", err.message);
      // We don't throw here to avoid failing the API request if the code is saved
      // But in a production app, you might want to handle this differently
    });

    return {
      success: true,
      message: "Password reset code sent successfully",
      data: { email: user.email },
    };
  } catch (error) {
    console.error("Error in sendPasswordResetCode:", error.message);
    throw error;
  }
};

const verifyResetCode = async (email, code) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email address not found");
      error.statusCode = 404;
      throw error;
    }

    if (!user.passwordResetCode || !user.passwordResetExpires) {
      const error = new Error("No reset code has been requested for this account");
      error.statusCode = 400;
      throw error;
    }

    if (user.passwordResetExpires < new Date()) {
      const error = new Error("Reset code has expired");
      error.statusCode = 400;
      throw error;
    }

    if (user.passwordResetCode !== code) {
      const error = new Error("Invalid reset code");
      error.statusCode = 400;
      throw error;
    }

    return {
      success: true,
      message: "Reset code verified successfully",
      data: { email: user.email },
    };
  } catch (error) {
    console.error("Error in verifyResetCode:", error.message);
    throw error;
  }
};

const resetPassword = async (email, code, newPassword) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("Email address not found");
      error.statusCode = 404;
      throw error;
    }

    if (!user.passwordResetCode || !user.passwordResetExpires) {
      const error = new Error("No reset code has been requested for this account");
      error.statusCode = 400;
      throw error;
    }

    if (user.passwordResetExpires < new Date()) {
      const error = new Error("Reset code has expired");
      error.statusCode = 400;
      throw error;
    }

    if (user.passwordResetCode !== code) {
      const error = new Error("Invalid reset code");
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in changePassword:", error.message);
    throw error;
  }
};

const deactivateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return { success: true, message: "User deactivated successfully" };
  } catch (error) {
    console.error("Error in deactivateUser:", error.message);
    throw error;
  }
};

/**
 * Update user's avatar
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file object from multer
 * @returns {Object} Updated user with new avatar URL
 */
const updateAvatar = async (userId, file) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete old avatar if exists (not the default one)
    if (user.avatar) {
      const oldFilename = user.avatar.split("/").pop();
      deleteOldFile(oldFilename, "avatar");
    }

    // Update with new avatar URL
    const avatarUrl = getFileUrl(file.filename, "avatar");
    user.avatar = avatarUrl;
    await user.save();

    return {
      success: true,
      message: "Avatar updated successfully",
      data: {
        user,
        avatarUrl,
      },
    };
  } catch (error) {
    console.error("Error in updateAvatar:", error.message);
    throw error;
  }
};

/**
 * Delete user's avatar (reset to default)
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
const deleteAvatar = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete old avatar file if exists
    if (user.avatar) {
      const oldFilename = user.avatar.split("/").pop();
      deleteOldFile(oldFilename, "avatar");
    }

    // Reset avatar to null (default)
    user.avatar = null;
    await user.save();

    return {
      success: true,
      message: "Avatar removed successfully",
      data: { user },
    };
  } catch (error) {
    console.error("Error in deleteAvatar:", error.message);
    throw error;
  }
};

/**
 * Follow a chef
 * @param {string} userId - ID of the user who wants to follow
 * @param {string} chefId - ID of the chef to be followed
 */
const followChef = async (userId, chefId) => {
  try {
    if (userId === chefId) {
      const error = new Error("You cannot follow yourself");
      error.statusCode = 400;
      throw error;
    }

    const chef = await User.findById(chefId);
    if (!chef || (chef.role !== "chef" && chef.role !== "admin")) {
      const error = new Error("Chef not found or invalid role");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: chefId } },
      { new: true }
    )
      .select("-password")
      .populate("following", "name avatar email role")
      .populate("favorites", "title image chef difficulty time");

    // Notify chef (non-blocking)
    await pushNotification(chefId, {
      type: "follow",
      actor: { _id: userId, name: user?.name || "", avatar: user?.avatar || null },
      message: `${user?.name || "Someone"} started following you`,
    });

    return { success: true, message: "Chef followed successfully", data: { user } };
  } catch (error) {
    console.error("Error in followChef:", error.message);
    throw error;
  }
};

/**
 * Unfollow a chef
 * @param {string} userId - ID of the user who wants to unfollow
 * @param {string} chefId - ID of the chef to be unfollowed
 */
const unfollowChef = async (userId, chefId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { following: chefId } },
      { new: true }
    )
      .select("-password")
      .populate("following", "name avatar email role")
      .populate("favorites", "title image chef difficulty time");

    return { success: true, message: "Chef unfollowed successfully", data: { user } };
  } catch (error) {
    console.error("Error in unfollowChef:", error.message);
    throw error;
  }
};

/**
 * Toggle favorite status of a recipe
 * @param {string} userId - ID of the user
 * @param {string} recipeId - ID of the recipe
 */
const toggleFavoriteRecipe = async (userId, recipeId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isFavorite = user.favorites.includes(recipeId);
    const update = isFavorite 
      ? { $pull: { favorites: recipeId } } 
      : { $addToSet: { favorites: recipeId } };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    )
      .select("-password")
      .populate("following", "name avatar email role")
      .populate("favorites", "title image chef difficulty time");

    // Notify recipe chef only when added to favorites
    if (!isFavorite) {
      try {
        const recipe = await Recipe.findById(recipeId).select("chef title image").lean();
        const chefId = recipe?.chef?.toString?.() || recipe?.chef;
        if (chefId && chefId.toString() !== userId.toString()) {
          await pushNotification(chefId, {
            type: "favorite",
            actor: { _id: userId, name: updatedUser?.name || "", avatar: updatedUser?.avatar || null },
            recipe: { _id: recipeId, title: recipe?.title || "", image: recipe?.image || null },
            message: `${updatedUser?.name || "Someone"} saved your recipe: ${recipe?.title || "Recipe"}`,
          });
        }
      } catch (e) {
        // ignore notification errors
      }
    }

    return { 
      success: true, 
      message: isFavorite ? "Recipe removed from favorites" : "Recipe added to favorites",
      data: { user: updatedUser, isFavorite: !isFavorite }
    };
  } catch (error) {
    console.error("Error in toggleFavoriteRecipe:", error.message);
    throw error;
  }
};

const getFollowersForChef = async (chefId) => {
  try {
    const followers = await User.find({ following: chefId, isActive: true })
      .select("name avatar role createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: { followers, total: followers.length } };
  } catch (error) {
    console.error("Error in getFollowersForChef:", error.message);
    throw error;
  }
};

const getNotifications = async (userId) => {
  try {
    const user = await User.findById(userId).select("notifications role").lean();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const list = (user.notifications || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = list.filter((n) => !n.read).length;
    return { success: true, data: { notifications: list, unread } };
  } catch (error) {
    console.error("Error in getNotifications:", error.message);
    throw error;
  }
};

const markNotificationsRead = async (userId, body = {}) => {
  try {
    const { ids } = body || {};
    if (Array.isArray(ids) && ids.length > 0) {
      await User.updateOne(
        { _id: userId },
        { $set: { "notifications.$[n].read": true } },
        { arrayFilters: [{ "n._id": { $in: ids } }] }
      );
    } else {
      await User.updateOne(
        { _id: userId },
        { $set: { "notifications.$[].read": true } }
      );
    }
    const updated = await User.findById(userId).select("notifications").lean();
    const list = updated?.notifications || [];
    return { success: true, data: { notifications: list, unread: list.filter((n) => !n.read).length } };
  } catch (error) {
    console.error("Error in markNotificationsRead:", error.message);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendPasswordResetCode,
  verifyResetCode,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  changePassword,
  deactivateUser,
  updateAvatar,
  deleteAvatar,
  followChef,
  unfollowChef,
  toggleFavoriteRecipe,
  getFollowersForChef,
  getNotifications,
  markNotificationsRead,
};
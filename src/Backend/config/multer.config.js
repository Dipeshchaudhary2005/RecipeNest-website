/**
 * ============================================
 * MULTER CONFIGURATION 
 * ============================================
 * Features:
 * - Upload images
 * - Clean + readable filenames
 * - Auto-create folders
 * - File type validation (images only)
 * - File size limit (5MB)
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * ============================================
 * 1. DEFINE UPLOAD DIRECTORIES
 * ============================================
 */
const UPLOAD_DIRS = {
  avatars: path.join(__dirname, "../../uploads/avatars"),
  recipes: path.join(__dirname, "../../uploads/recipes"),
};

/**
 * ============================================
 * 2. CREATE DIRECTORIES IF NOT EXISTS
 * ============================================
 */
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

/**
 * ============================================
 * 3. STORAGE CONFIGURATION
 * ============================================
 */
const createStorage = (uploadDir) => {
  return multer.diskStorage({
    // Where to store files
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },

    // How to name files
    filename: (req, file, cb) => {
      // Get original name without extension
      const originalName = path.parse(file.originalname).name;

      // Clean filename
      const cleanName = originalName
        .toLowerCase()
        .replace(/\s+/g, "-")          // replace spaces with -
        .replace(/[^a-z0-9\-]/g, "");  // remove special characters

      // Create unique suffix
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      // Get extension
      const extension = path.extname(file.originalname);

      // Final filename
      const finalName = `${cleanName}-${uniqueSuffix}${extension}`;

      cb(null, finalName);
    },
  });
};

/**
 * ============================================
 * 4. FILE FILTER (ONLY IMAGES ALLOWED)
 * ============================================
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    const error = new Error(
      "❌ Only image files (jpg, png, gif, webp) are allowed"
    );
    error.code = "LIMIT_FILE_TYPE";
    cb(error, false);
  }
};

/**
 * ============================================
 * 5. CREATE MULTER CONFIG
 * ============================================
 */
const createMulterConfig = (uploadDir, maxFileSize = 5 * 1024 * 1024) => {
  return multer({
    storage: createStorage(uploadDir),
    fileFilter: fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: 20, // Increased to allow cover + up to 10 steps + buffer
    },
  });
};

/**
 * ============================================
 * 6. MULTER INSTANCES
 * ============================================
 */
const uploadAvatar = createMulterConfig(UPLOAD_DIRS.avatars);
const uploadRecipeImage = createMulterConfig(UPLOAD_DIRS.recipes);

/**
 * ============================================
 * 7. DELETE OLD FILE
 * ============================================
 */
const deleteOldFile = async (fileIdentifier, type) => {
  if (!fileIdentifier) return;

  // If it's a URL (e.g., /uploads/recipes/filename.jpg), extract the filename
  let filename = fileIdentifier;
  if (fileIdentifier.includes("/uploads/")) {
    filename = fileIdentifier.split("/").pop();
  }

  const dir =
    type === "avatar"
      ? UPLOAD_DIRS.avatars
      : UPLOAD_DIRS.recipes;

  const filePath = path.join(dir, filename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    } else {
      console.warn(`⚠️ File not found for deletion: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);
  }
};

/**
 * ============================================
 * 8. GET FILE URL
 * ============================================
 */
const getFileUrl = (filename, type) => {
  if (!filename) return null;

  const folder = type === "avatar" ? "avatars" : "recipes";

  return `/uploads/${folder}/${filename}`;
};

/**
 * ============================================
 * EXPORT MODULES
 * ============================================
 */
module.exports = {
  uploadAvatar,
  uploadRecipeImage,
  deleteOldFile,
  getFileUrl,
  UPLOAD_DIRS,
};
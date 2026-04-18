const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

module.exports = {
  // Server
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database
  DB_URL: process.env.DB_URL || "mongodb://localhost:27017/BackendRecipeDB",
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  
  // CORS
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || "http://localhost:8080/api/auth/google/callback",

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || '"RecipeNest" <noreply@recipenest.com>',
};
import { BASE_URL } from "./services/api";

/**
 * Normalizes an image path to a full URL if it starts with /uploads.
 * If it's already a full URL or a relative local path (like blob), it returns as is.
 * @param {string} path - The path or URL to normalize
 * @returns {string} The normalized URL
 */
export const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  const normalized = path.replace(/\\/g, "/").trim();

  // If it's already a full URL or data URI
  if (/^(https?:|data:)/i.test(normalized)) {
    return normalized;
  }

  // Extract any uploads path and normalize it to an absolute backend URL
  const uploadsIndex = normalized.indexOf("/uploads");
  if (uploadsIndex !== -1) {
    const uploadsPath = normalized.slice(uploadsIndex);
    return `${BASE_URL}${uploadsPath}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${BASE_URL}/${normalized}`;
  }

  return normalized;
};

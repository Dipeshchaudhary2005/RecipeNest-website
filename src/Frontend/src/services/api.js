import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
export const BASE_URL = "http://localhost:8080";

export const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"; // Default recipe image
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach the JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post("/users/login", credentials),
  register: (userData) => api.post("/users/register", userData),
  forgotPassword: (email) => api.post("/users/forgot-password", { email }),
  verifyResetCode: ({ email, code }) => api.post("/users/verify-reset-code", { email, code }),
  resetPassword: ({ email, code, password }) => api.post("/users/reset-password", { email, code, password }),
  sendSignupOTP: (email) => api.post("/users/send-signup-otp", { email }),
  verifySignupOTP: ({ email, code }) => api.post("/users/verify-signup-otp", { email, code }),
  getProfile: () => api.get("/users/profile"),
};

export const recipeAPI = {
  getAll: (params) => api.get("/recipes", { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  getReviews: (id) => api.get(`/recipes/${id}/reviews`),
  addReview: (id, { rating, comment }) => api.post(`/recipes/${id}/reviews`, { rating, comment }),
  create: (recipeData) => {
    const isFormData = recipeData instanceof FormData;
    return api.post("/recipes", recipeData, {
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
    });
  },
  update: (id, recipeData) => {
    const isFormData = recipeData instanceof FormData;
    return api.put(`/recipes/${id}`, recipeData, {
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
    });
  },
  delete: (id) => api.delete(`/recipes/${id}`),
  getMyRecipes: (params) => api.get("/recipes/my-recipes", { params }),
  getMyStats: () => api.get("/recipes/my-stats"),
  toggleFavorite: (id) => api.put(`/users/favorites/${id}`),
};

export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put("/users/profile", data),
  updateAvatar: (formData) => api.patch("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  followChef: (id) => api.put(`/users/follow/${id}`),
  unfollowChef: (id) => api.put(`/users/unfollow/${id}`),
  getMyFollowers: () => api.get("/users/followers"),
  getNotifications: () => api.get("/users/notifications"),
  markNotificationsRead: (ids) => api.patch("/users/notifications/read", ids ? { ids } : {}),
};

export const adminAPI = {
  // User management
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  deactivateUser: (id) => api.delete(`/users/${id}`),
  banUser: (id) => api.post(`/users/${id}/ban`),
  unbanUser: (id) => api.post(`/users/${id}/unban`),
  
  // Recipe management  
  getPendingRecipes: () => api.get("/recipes?status=Pending Review"),
  approveRecipe: (id) => api.put(`/recipes/${id}`, { status: "Live" }),
  rejectRecipe: (id, reason) => api.put(`/recipes/${id}`, { status: "Rejected", rejectionReason: reason }),
  
  // Stats
  getStats: () => api.get("/admin/stats"),
};

export default api;

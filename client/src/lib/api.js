import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Restaurants API
export const restaurantsAPI = {
  getAll: (params) => api.get("/restaurants", { params }),
  getPromoted: () => api.get("/restaurants/promoted"),
  getById: (id) => api.get(`/restaurants/${id}`),
  getDashboardStats: () => api.get("/restaurants/dashboard/stats"),
};

// Cart API
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId, quantity) => api.post("/cart/add", { productId, quantity }),
  update: (productId, quantity) =>
    api.put("/cart/update", { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete("/cart/clear"),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getMyOrders: () => api.get("/orders/my-orders"),
  getRestaurantOrders: () => api.get("/orders/restaurant-orders"),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getPendingRestaurants: () => api.get("/admin/restaurants/pending"),
  approveRestaurant: (id, isApproved) =>
    api.patch(`/admin/restaurants/${id}/approval`, { isApproved }),
  updatePromotions: (promotedRestaurants) =>
    api.patch("/admin/restaurants/promotions", { promotedRestaurants }),
  getUsers: () => api.get("/admin/users"),
  getOrders: () => api.get("/admin/orders"),
};

export default api;

import axios from 'axios';

// Production: gunakan env var dari Vercel (VITE_API_URL)
// Development: fallback ke auto-detect hostname + port 5000
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ponbean_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ponbean_token');
      localStorage.removeItem('ponbean_user');
      if (!window.location.pathname.startsWith('/menu')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Menus
export const menuAPI = {
  getAll: (params) => api.get('/menus', { params }),
  getById: (id) => api.get(`/menus/${id}`),
  create: (data) => api.post('/menus', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/menus/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/menus/${id}`),
  toggleAvailability: (id) => api.patch(`/menus/${id}/toggle`),
  getCategories: () => api.get('/menus/categories'),
  createCategory: (data) => api.post('/menus/categories', data),
  updateCategory: (id, data) => api.put(`/menus/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menus/categories/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Tables
export const tableAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  delete: (id) => api.delete(`/tables/${id}`),
  toggleStatus: (id) => api.patch(`/tables/${id}/toggle`),
  regenerateQR: (id) => api.post(`/tables/${id}/regenerate-qr`),
  regenerateAllQR: () => api.post('/tables/regenerate-all-qr'),
  getQRData: (id) => api.get(`/tables/${id}/qr-data`),
  getQRPrintCards: (id) => api.get(`/tables/${id}/qr-print`),
};

// Reports
export const reportAPI = {
  get: (params) => api.get('/reports', { params }),
};

// Payment (Midtrans)
export const paymentAPI = {
  create: (data) => api.post('/payment/create', data),
  checkStatus: (orderId) => api.get(`/payment/status/${orderId}`),
};

export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || `http://${window.location.hostname}:5000/uploads`;

export default api;

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omokabet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('omokabet_token');
      localStorage.removeItem('omokabet_user');
      // Don't redirect if already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Events
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getLive: () => api.get('/events/live'),
  getFeatured: () => api.get('/events/featured'),
};

// Sports
export const sportsAPI = {
  getAll: () => api.get('/sports'),
};

// Bets
export const betsAPI = {
  place: (data) => api.post('/bets', data),
  getAll: (params) => api.get('/bets', { params }),
  getById: (id) => api.get(`/bets/${id}`),
  cashout: (id) => api.post(`/bets/${id}/cashout`),
};

// Wallet
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  creditUser: (id, data) => api.post(`/admin/users/${id}/credit`, data),
  // Bets
  getBets: (params) => api.get('/admin/bets', { params }),
  settleBet: (id, data) => api.put(`/admin/bets/${id}`, data),
  // Transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  // Events
  getEvents: (params) => api.get('/admin/events', { params }),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  generateEvents: () => api.post('/admin/events/generate'),
};

export default api;

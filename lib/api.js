import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('devpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('devpulse_token');
      localStorage.removeItem('devpulse_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.patch('/api/auth/profile', data),
  changePassword: (data) => api.patch('/api/auth/password', data),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (params) => api.get('/api/tasks', { params }),
  getStats: () => api.get('/api/tasks/stats'),
  getMyTasks: () => api.get('/api/tasks/my'),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

// ─── Milestones ──────────────────────────────────────────────────────────────
export const milestonesAPI = {
  getAll: (params) => api.get('/api/milestones', { params }),
  getStats: () => api.get('/api/milestones/stats'),
  getById: (id) => api.get(`/api/milestones/${id}`),
  create: (data) => api.post('/api/milestones', data),
  update: (id, data) => api.patch(`/api/milestones/${id}`, data),
  delete: (id) => api.delete(`/api/milestones/${id}`),
};

// ─── Activity Feed ───────────────────────────────────────────────────────────
export const activityAPI = {
  getAll: (params) => api.get('/api/activity', { params }),
  getSummary: () => api.get('/api/activity/summary'),
};

// ─── Health ──────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;

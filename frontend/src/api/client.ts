import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Auto token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Botanical Collection API (CollectPlant)
export const collectionApi = {
  identify: async (formData: FormData) => {
    return apiClient.post('/v1/collection/plants/identify/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: async (params?: Record<string, any>) => {
    return apiClient.get('/v1/collection/plants/', { params });
  },
  getById: async (id: number) => {
    return apiClient.get(`/v1/collection/plants/${id}/`);
  },
  create: async (formData: FormData) => {
    return apiClient.post('/v1/collection/plants/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: async (id: number, data: Record<string, any>) => {
    return apiClient.patch(`/v1/collection/plants/${id}/`, data);
  },
  delete: async (id: number) => {
    return apiClient.delete(`/v1/collection/plants/${id}/`);
  },
  getStats: async () => {
    return apiClient.get('/v1/collection/plants/stats/');
  },
};

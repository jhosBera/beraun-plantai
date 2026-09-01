import { create } from 'zustand';
import { User } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUserProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/login/', credentials);
      const { access, refresh, user } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token: access, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/register/', data);
      const { access, refresh, user } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token: access, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUserProfile: async () => {
    try {
      const res = await apiClient.get('/users/me/');
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  },

  updateProfile: async (data) => {
    const res = await apiClient.put('/users/me/', data);
    const updatedUser = res.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  }
}));

import { create } from 'zustand';
import { Notification } from '../types';
import { apiClient } from '../api/client';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/notifications/');
      set({ notifications: res.data.results || res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching notifications:', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count/');
      set({ unreadCount: res.data.unread_count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await apiClient.post(`/notifications/${id}/read/`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post('/notifications/read-all/');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
}));

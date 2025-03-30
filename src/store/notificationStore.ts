
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'task' | 'appointment' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          read: false,
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((notification) =>
            notification.id === id && !notification.read
              ? { ...notification, read: true }
              : notification
          );
          
          // Count how many notifications were actually marked as read
          const diff = state.notifications.filter(n => n.id === id && !n.read).length;
          
          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - diff),
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => {
          const notificationToDelete = state.notifications.find(n => n.id === id);
          const unreadDelta = notificationToDelete && !notificationToDelete.read ? 1 : 0;
          
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: Math.max(0, state.unreadCount - unreadDelta),
          };
        });
      },
      
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);

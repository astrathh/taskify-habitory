
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
  initialNotificationSent: boolean;
  
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  setInitialNotificationSent: (sent: boolean) => void;
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
      initialNotificationSent: false,
      
      addNotification: async (notificationData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .insert([{
              ...notificationData,
              read: false
            }])
            .select()
            .single();
          
          if (error) throw error;
          
          // Cast the data to the correct type
          const typedNotification = data as unknown as Notification;
          
          set((state) => ({
            notifications: [typedNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
            loading: false,
          }));
        } catch (error) {
          console.error('Error adding notification:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      markAsRead: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Cast the data to the correct type
          const typedNotification = data as unknown as Notification;
          
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
              loading: false,
            };
          });
        } catch (error) {
          console.error('Error marking notification as read:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      markAllAsRead: async () => {
        set({ loading: true, error: null });
        try {
          const user = supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false);
          
          if (error) throw error;
          
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
            unreadCount: 0,
            loading: false,
          }));
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      deleteNotification: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => {
            const notificationToDelete = state.notifications.find(n => n.id === id);
            const unreadDelta = notificationToDelete && !notificationToDelete.read ? 1 : 0;
            
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: Math.max(0, state.unreadCount - unreadDelta),
              loading: false,
            };
          });
        } catch (error) {
          console.error('Error deleting notification:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Cast the data to the correct type and ensure type values are valid
          const typedNotifications = (data || []).map(notification => {
            // Ensure that type is a valid NotificationType
            const validType = ['task', 'appointment', 'system'].includes(notification.type) 
              ? notification.type as NotificationType 
              : 'system';
            
            return {
              ...notification,
              type: validType,
              read: !!notification.read, // Ensure boolean
            } as Notification;
          });
          
          const unreadCount = typedNotifications.filter((n) => !n.read).length;
          set({ 
            notifications: typedNotifications, 
            unreadCount,
            loading: false 
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },
      
      setInitialNotificationSent: (sent) => {
        set({ initialNotificationSent: sent });
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

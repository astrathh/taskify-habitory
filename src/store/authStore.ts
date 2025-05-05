
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null; // Add missing error property
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  clearError: () => void; // Add missing clearError method
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null, // Initialize error state

  checkAuth: async () => {
    try {
      set({ loading: true });
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        set({ 
          user: data.session.user, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao realizar login');
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, loading: false });
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao realizar logout');
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ error: null }); // Clear any existing errors
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Erro ao realizar login com Google');
      set({ error: error.message });
    }
  },

  loginWithGithub: async () => {
    try {
      set({ error: null }); // Clear any existing errors
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Github login error:', error);
      toast.error(error.message || 'Erro ao realizar login com Github');
      set({ error: error.message });
    }
  },

  // Add clearError method
  clearError: () => {
    set({ error: null });
  },
}));

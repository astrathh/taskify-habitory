
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer login', 
            loading: false 
          });
          throw error;
        }
      },
      
      register: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name
              }
            }
          });
          
          if (error) throw error;
          
          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: !!data.session, 
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao criar conta', 
            loading: false 
          });
          throw error;
        }
      },
      
      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });
          
          if (error) throw error;
          
          // O redirecionamento será tratado pelo Supabase
          // User e session serão atualizados pelo onAuthStateChange
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer login com Google', 
            loading: false 
          });
          throw error;
        }
      },
      
      logout: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            session: null,
            isAuthenticated: false, 
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer logout', 
            loading: false 
          });
          throw error;
        }
      },
      
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          loading: false 
        });
      },
      
      setSession: (session) => {
        set({ 
          session,
          user: session?.user || null,
          isAuthenticated: !!session
        });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

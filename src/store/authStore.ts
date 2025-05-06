
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null; // Added error property
  clearError: () => void; // Added clearError method
  
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  clearError: () => {
    set({ error: null });
  },
  
  setSession: (session) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session
    });
  },
  
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      set({
        session: data.session,
        user: data.user,
        isAuthenticated: !!data.session,
        loading: false
      });
    } catch (error) {
      console.error('Error during sign in:', error);
      set({ 
        error: error.message || 'Falha ao fazer login. Verifique suas credenciais.',
        loading: false 
      });
    }
  },
  
  signUp: async (email, password, name) => {
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
        session: data.session,
        user: data.user,
        isAuthenticated: !!data.session,
        loading: false
      });
    } catch (error) {
      console.error('Error during sign up:', error);
      set({ 
        error: error.message || 'Falha ao criar conta.',
        loading: false 
      });
    }
  },
  
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      set({ 
        error: error.message || 'Falha ao sair.',
        loading: false 
      });
    }
  }
}));

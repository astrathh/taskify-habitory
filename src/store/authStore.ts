
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for signIn
  signUp: (email: string, password: string, name: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>; // Alias for signUp
  signOut: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  loginWithGoogle: () => Promise<void>;
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
  
  // Alias for signIn
  login: async (email, password) => {
    const store = useAuthStore.getState();
    return store.signIn(email, password);
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
  
  // Alias for signUp
  register: async (email, password, name) => {
    const store = useAuthStore.getState();
    return store.signUp(email, password, name);
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
  },
  
  // Alias for signOut
  logout: async () => {
    const store = useAuthStore.getState();
    return store.signOut();
  },
  
  // Google authentication
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
      
      // The actual session will be handled on redirect
    } catch (error) {
      console.error('Error during Google login:', error);
      set({ 
        error: error.message || 'Falha ao fazer login com Google.',
        loading: false 
      });
    }
  }
}));

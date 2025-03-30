
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { signIn, signUp, signInWithGoogle, signOut, getAuthToken } from '@/lib/firebase';

type AuthState = {
  user: User | null;
  loading: boolean;
  token: string | null;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      token: null,
      error: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const user = await signIn(email, password);
          const token = await getAuthToken();
          set({ user, token, isAuthenticated: true, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer login', 
            loading: false 
          });
        }
      },
      
      register: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
          const user = await signUp(email, password, name);
          const token = await getAuthToken();
          set({ user, token, isAuthenticated: true, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao criar conta', 
            loading: false 
          });
        }
      },
      
      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const user = await signInWithGoogle();
          const token = await getAuthToken();
          set({ user, token, isAuthenticated: true, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer login com Google', 
            loading: false 
          });
        }
      },
      
      logout: async () => {
        set({ loading: true });
        try {
          await signOut();
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Falha ao fazer logout', 
            loading: false 
          });
        }
      },
      
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          loading: false 
        });
      },
      
      setToken: (token) => {
        set({ token });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

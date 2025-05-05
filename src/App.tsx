
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/authStore';

import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';
import Index from '@/pages/Index';
import TaskForm from '@/pages/TaskForm';
import AppointmentForm from '@/pages/AppointmentForm';
import AppointmentsPage from '@/pages/AppointmentsPage';
import HabitForm from '@/pages/HabitForm';

// Unified tracking page that replaces both Tasks and Habits pages
import TrackablePage from '@/pages/TrackablePage';

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-cfff00 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <BrowserRouter>
        <Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            <Route index element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TrackablePage />} />
              <Route path="tasks/new" element={<TaskForm />} />
              <Route path="tasks/edit/:id" element={<TaskForm />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="appointments/new" element={<AppointmentForm />} />
              <Route path="appointments/edit/:id" element={<AppointmentForm />} />
              <Route path="habits/new" element={<HabitForm />} />
              <Route path="habits/edit/:id" element={<HabitForm />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

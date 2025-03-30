
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";

// App Pages
import Dashboard from "./pages/Dashboard";
import TaskForm from "./pages/TaskForm";
import AppointmentForm from "./pages/AppointmentForm";
import NotFound from "./pages/NotFound";

const App = () => {
  const { setSession, isAuthenticated } = useAuthStore();

  // Set up auth state listener
  useEffect(() => {
    // First get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/" replace />
        } />
        <Route path="/register" element={
          !isAuthenticated ? <Register /> : <Navigate to="/" replace />
        } />
        
        {/* Auth callback route for OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* App Routes - Protected by AppLayout */}
        <Route path="/" element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
        }>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<div>Tasks Page</div>} />
          <Route path="tasks/new" element={<TaskForm />} />
          <Route path="appointments" element={<div>Appointments Page</div>} />
          <Route path="appointments/new" element={<AppointmentForm />} />
          <Route path="habits" element={<div>Habits Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
        
        {/* Catch-all redirect to 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;

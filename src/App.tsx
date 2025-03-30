
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useEffect } from "react";
import { onAuthStateChange } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// App Pages
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { setUser, setToken, loading } = useAuthStore();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* App Routes - Protected by AppLayout */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<div>Tasks Page</div>} />
              <Route path="appointments" element={<div>Appointments Page</div>} />
              <Route path="habits" element={<div>Habits Page</div>} />
              <Route path="settings" element={<div>Settings Page</div>} />
            </Route>
            
            {/* Catch-all redirect to 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddSubject from './pages/AddSubject';
import Prediction from './pages/Prediction';
import BunkCalculator from './pages/BunkCalculator';
import AIAdvisor from './pages/AIAdvisor';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Layout
import AppLayout from './components/layout/AppLayout';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading AttendWise...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Public route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects/add" element={<AddSubject />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/bunk-calculator" element={<BunkCalculator />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#334155',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

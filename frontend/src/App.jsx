import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import FloatingThemeSwitcher from './components/common/FloatingThemeSwitcher';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import FamilySetupPage from './pages/family/FamilySetupPage';

// Protected Workspace Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import DocumentVaultPage from './pages/documents/DocumentVaultPage';
import ExpiryTrackerPage from './pages/expiry/ExpiryTrackerPage';
import WorkflowsPage from './pages/workflows/WorkflowsPage';
import WorkflowDetailPage from './pages/workflows/WorkflowDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import CalendarPage from './pages/calendar/CalendarPage';
import FamilyMembersPage from './pages/family/FamilyMembersPage';
import FamilySettingsPage from './pages/family/FamilySettingsPage';
import ActivityHistoryPage from './pages/activity/ActivityHistoryPage';
import ProfilePage from './pages/profile/ProfilePage';

// Guard for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading GharSahayak...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has not created or joined a family yet, redirect to family setup
  if (!user.familyId && window.location.pathname !== '/family-setup') {
    return <Navigate to="/family-setup" replace />;
  }

  return children;
}

// Redirect already logged in users away from public auth pages
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.familyId) return <Navigate to="/dashboard" replace />;
  if (user && !user.familyId) return <Navigate to="/family-setup" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Family Setup */}
              <Route path="/family-setup" element={<ProtectedRoute><FamilySetupPage /></ProtectedRoute>} />

              {/* Protected Workspace Layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vault" element={<DocumentVaultPage />} />
                <Route path="/expiry" element={<ExpiryTrackerPage />} />
                <Route path="/workflows" element={<WorkflowsPage />} />
                <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/family/members" element={<FamilyMembersPage />} />
                <Route path="/family/settings" element={<FamilySettingsPage />} />
                <Route path="/activity" element={<ActivityHistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Universal Floating Theme Switcher */}
            <FloatingThemeSwitcher />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

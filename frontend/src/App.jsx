import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Zustand stores
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';

// Lazy-loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const WomenSafety = lazy(() => import('./pages/WomenSafety'));
const ScamRadar = lazy(() => import('./pages/ScamRadar'));
const Community = lazy(() => import('./pages/Community'));
const OfflineDashboard = lazy(() => import('./pages/OfflineDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PoliceDashboard = lazy(() => import('./pages/PoliceDashboard'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const RescueDashboard = lazy(() => import('./pages/RescueDashboard'));

// Components
import Navbar from './components/Navbar';
import FloatingActionContainer from './components/FloatingActionContainer';
import Global3DBackdrop from './components/Global3DBackdrop';

// Create React Query Client
const queryClient = new QueryClient();

// Dynamic Dashboard selector based on Role
const DashboardSelector = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#02050a] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'POLICE':
      return <PoliceDashboard />;
    case 'HOSPITAL':
      return <HospitalDashboard />;
    case 'RESCUE':
      return <RescueDashboard />;
    case 'TOURIST':
    default:
      return <TouristDashboard />;
  }
};

// Protected routes wrapper for authenticated tourists
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#02050a] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user, token, loadUser } = useAuthStore();
  const { initSocket, fetchData } = useAppStore();
  const location = useLocation();

  // Load user details on fresh boot
  useEffect(() => {
    loadUser();
  }, []);

  // Initialize socket feed and global dataset queries when user token updates
  useEffect(() => {
    if (user && token) {
      initSocket(user.id, user.role);
      fetchData(token, user.role);
    }
  }, [user, token]);

  const isConsoleRoute = ['/admin', '/dashboard'].includes(location.pathname) && user?.role !== 'TOURIST';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#02050a] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-500 relative overflow-hidden">
      {!isConsoleRoute && <Global3DBackdrop />}
      <Navbar />
      
      <main className="flex-grow" style={{ paddingTop: 'var(--navbar-height, 68px)' }}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<DashboardSelector />} />
            
            <Route path="/planner" element={
              <ProtectedRoute>
                <TripPlanner />
              </ProtectedRoute>
            } />
            
            <Route path="/women-safety" element={
              <ProtectedRoute>
                <WomenSafety />
              </ProtectedRoute>
            } />
            
            <Route path="/scam-radar" element={
              <ProtectedRoute>
                <ScamRadar />
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />

            <Route path="/offline" element={
              <ProtectedRoute>
                <OfflineDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Floating emergency widgets for logged in users */}
      {user && <FloatingActionContainer />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <AppContent />
              </Router>
            </QueryClientProvider>
          </AppProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

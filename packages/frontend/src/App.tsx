import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { UserRole } from '@crm/shared/types';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

console.log('🔍 App: Component loading');

// Lazy load pages with error handling
const lazyLoad = (importFn: () => Promise<any>) => {
  console.log('🔍 App: Lazy loading component');
  return React.lazy(() => 
    importFn().catch(error => {
      console.error('❌ App: Error lazy loading component:', error);
      throw error;
    })
  );
};

const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
const Tickets = lazyLoad(() => import('./pages/Tickets/index'));
const Users = lazyLoad(() => import('./pages/Users'));
const Reports = lazyLoad(() => import('./pages/Reports'));
const Settings = lazyLoad(() => import('./pages/Settings'));
const Profile = lazyLoad(() => import('./pages/Profile'));
const FAQ = lazyLoad(() => import('./pages/FAQ/index'));

export const App: React.FC = () => {
  console.log('🔍 App: Component rendering');
  const { user } = useAuth();
  const isCustomer = user?.user_metadata?.role === UserRole.CUSTOMER;

  console.log('🔍 App: User role:', user?.user_metadata?.role);

  // Helper function to determine the default route based on user role
  const getDefaultRoute = () => {
    const role = user?.user_metadata?.role;
    if (role === UserRole.CUSTOMER) {
      return ROUTES.FAQ;
    }
    return ROUTES.TICKETS; // Default to tickets for ADMIN and WORKER
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.LOGIN} element={<LoginForm />} />
          <Route path={ROUTES.REGISTER} element={<RegisterForm />} />

          {/* FAQ route - default for customers */}
          <Route
            path={ROUTES.FAQ}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <FAQ />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.WORKER]}>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.TICKETS + '/*'}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Tickets />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.USERS}
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Users />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.REPORTS}
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.WORKER]}>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Reports />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Settings />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Profile />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root based on user role */}
          <Route
            path="/"
            element={
              <Navigate 
                to={getDefaultRoute()} 
                replace 
              />
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <Navigate 
                to={getDefaultRoute()} 
                replace 
              />
            }
          />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}; 
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { PersonCardSkeletonList } from './components/ui/Skeleton';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const PeoplePage = lazy(() => import('./pages/PeoplePage').then((m) => ({ default: m.PeoplePage })));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage').then((m) => ({ default: m.PersonDetailPage })));
const AddEditPersonPage = lazy(() => import('./pages/AddEditPersonPage').then((m) => ({ default: m.AddEditPersonPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const RemindersPage = lazy(() => import('./pages/RemindersPage').then((m) => ({ default: m.RemindersPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function PageFallback() {
  return <PersonCardSkeletonList count={3} />;
}

function AppContent() {
  useTheme();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Suspense fallback={<PageFallback />}><HomePage /></Suspense>} />
        <Route path="/people" element={<Suspense fallback={<PageFallback />}><PeoplePage /></Suspense>} />
        <Route path="/people/new" element={<Suspense fallback={<PageFallback />}><AddEditPersonPage /></Suspense>} />
        <Route path="/people/:id" element={<Suspense fallback={<PageFallback />}><PersonDetailPage /></Suspense>} />
        <Route path="/people/:id/edit" element={<Suspense fallback={<PageFallback />}><AddEditPersonPage /></Suspense>} />
        <Route path="/categories" element={<Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense>} />
        <Route path="/reminders" element={<Suspense fallback={<PageFallback />}><RemindersPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export function App() {
  const authValue = useAuthProvider();

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={authValue}>
        <HashRouter>
          <ToastProvider>
            <AuthGuard>
              <AppContent />
            </AuthGuard>
          </ToastProvider>
        </HashRouter>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

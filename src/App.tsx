import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { AddEditPersonPage } from './pages/AddEditPersonPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useTheme } from './hooks/useTheme';

function AppContent() {
  useTheme();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/new" element={<AddEditPersonPage />} />
        <Route path="/people/:id" element={<PersonDetailPage />} />
        <Route path="/people/:id/edit" element={<AddEditPersonPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

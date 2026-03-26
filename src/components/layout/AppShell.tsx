import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '../ui/InstallBanner';
import { QuickAddFAB } from '../ui/QuickAdd';
import { CommandSearch, useCommandSearch } from '../ui/CommandSearch';
import styles from './AppShell.module.css';

export function AppShell() {
  const { open: searchOpen, setOpen: setSearchOpen } = useCommandSearch();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomNav />
      <QuickAddFAB />
      <InstallBanner />
      {searchOpen && <CommandSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

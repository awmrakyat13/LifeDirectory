import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Life Directory</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className={styles.userSection}>
          <div className={styles.userEmail}>{user.email}</div>
          <button className={styles.signOutBtn} onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}

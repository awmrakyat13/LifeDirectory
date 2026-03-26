import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: '\u2302', label: 'Home' },
  { to: '/people', icon: '\u{1F465}', label: 'People' },
  { to: '/categories', icon: '\u2630', label: 'Categories' },
  { to: '/reminders', icon: '\u{1F514}', label: 'Reminders' },
  { to: '/settings', icon: '\u2699', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Life Directory</div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
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
    </aside>
  );
}

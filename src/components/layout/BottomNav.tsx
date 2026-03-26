import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const navItems = [
  { to: '/', icon: '\u2302', label: 'Home' },
  { to: '/people', icon: '\u{1F465}', label: 'People' },
  { to: '/reminders', icon: '\u{1F514}', label: 'Reminders' },
  { to: '/settings', icon: '\u2699', label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
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
  );
}

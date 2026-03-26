import { NavLink } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../../constants/navigation';
import styles from './BottomNav.module.css';

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {BOTTOM_NAV_ITEMS.map((item) => (
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

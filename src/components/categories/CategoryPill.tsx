import styles from './CategoryPill.module.css';

interface CategoryPillProps {
  name: string;
  color: string;
  onClick?: () => void;
}

export function CategoryPill({ name, color, onClick }: CategoryPillProps) {
  return (
    <span
      className={`${styles.pill} ${onClick ? styles.clickable : ''}`}
      style={{ background: `${color}20`, color }}
      onClick={onClick}
    >
      <span className={styles.dot} style={{ background: color }} />
      {name}
    </span>
  );
}

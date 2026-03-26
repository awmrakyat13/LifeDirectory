import type { Person } from '../../models/types';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
  stack: Array<'me' | string>;
  people: Person[];
  myName?: string;
  onNavigate: (index: number) => void;
}

export function Breadcrumbs({ stack, people, myName, onNavigate }: BreadcrumbsProps) {
  function getLabel(id: 'me' | string): string {
    if (id === 'me') return myName || 'Me';
    const person = people.find((p) => p.id === id);
    return person ? `${person.firstName} ${person.lastName}` : '?';
  }

  return (
    <div className={styles.container}>
      {stack.map((id, i) => {
        const isLast = i === stack.length - 1;
        return (
          <span key={i}>
            {i > 0 && <span className={styles.separator}> &rsaquo; </span>}
            <button
              className={`${styles.crumb} ${isLast ? styles.current : ''}`}
              onClick={isLast ? undefined : () => onNavigate(i)}
              disabled={isLast}
            >
              {getLabel(id)}
            </button>
          </span>
        );
      })}
    </div>
  );
}

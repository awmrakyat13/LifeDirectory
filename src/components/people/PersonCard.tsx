import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Avatar } from '../ui/Avatar';
import { CategoryPill } from '../categories/CategoryPill';
import { usePersonActions } from '../../hooks/usePeople';
import type { Person } from '../../models/types';
import styles from './PersonCard.module.css';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const { toggleFavorite } = usePersonActions();

  const categories = useLiveQuery(async () => {
    const joins = await db.personCategories
      .where('personId')
      .equals(person.id)
      .toArray();
    const catIds = joins.map((j) => j.categoryId);
    if (catIds.length === 0) return [];
    return db.categories.where('id').anyOf(catIds).toArray();
  }, [person.id], []);

  return (
    <div className={styles.card}>
      <Link to={`/people/${person.id}`} style={{ display: 'contents' }}>
        <Avatar
          photoBlob={person.photoBlob}
          firstName={person.firstName}
          lastName={person.lastName}
          size={48}
        />
        <div className={styles.info}>
          <div className={styles.name}>
            {person.firstName} {person.lastName}
            {person.nickname && (
              <span className={styles.nickname}> ({person.nickname})</span>
            )}
          </div>
          <div className={styles.meta}>
            {person.occupation && (
              <span className={styles.occupation}>
                {person.occupation}
                {person.company ? ` at ${person.company}` : ''}
              </span>
            )}
          </div>
          {categories.length > 0 && (
            <div className={styles.meta}>
              {categories.map((cat) => (
                <CategoryPill key={cat.id} name={cat.name} color={cat.color} />
              ))}
            </div>
          )}
        </div>
      </Link>
      <button
        className={`${styles.favBtn} ${person.isFavorite ? styles.favActive : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(person.id);
        }}
        aria-label={person.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {person.isFavorite ? '\u2605' : '\u2606'}
      </button>
    </div>
  );
}

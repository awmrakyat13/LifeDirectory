import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subscribePersonCategories, subscribeCategories } from '../../firebase/firestore';
import { Avatar } from '../ui/Avatar';
import { CategoryPill } from '../categories/CategoryPill';
import { usePersonActions } from '../../hooks/usePeople';
import type { Person, Category, PersonCategory } from '../../models/types';
import styles from './PersonCard.module.css';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const { user } = useAuth();
  const { toggleFavorite } = usePersonActions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [personCategories, setPersonCategories] = useState<PersonCategory[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeCategories(user.uid, setCategories);
    const unsub2 = subscribePersonCategories(user.uid, setPersonCategories);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const personCatIds = personCategories
    .filter((pc) => pc.personId === person.id)
    .map((pc) => pc.categoryId);
  const personCats = categories.filter((c) => personCatIds.includes(c.id));

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
          {personCats.length > 0 && (
            <div className={styles.meta}>
              {personCats.map((cat) => (
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

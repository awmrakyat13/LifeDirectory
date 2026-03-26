import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/database';
import { Avatar } from '../../ui/Avatar';
import styles from '../PersonForm.module.css';

interface LinkedPeopleSectionProps {
  linkedPersonIds: string[];
  setLinkedPersonIds: (ids: string[]) => void;
  currentPersonId?: string;
}

export function LinkedPeopleSection({ linkedPersonIds, setLinkedPersonIds, currentPersonId }: LinkedPeopleSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const linkedPeople = useLiveQuery(async () => {
    if (linkedPersonIds.length === 0) return [];
    return db.people.where('id').anyOf(linkedPersonIds).toArray();
  }, [linkedPersonIds], []);

  const searchResults = useLiveQuery(async () => {
    if (searchQuery.length < 2) return [];
    const all = await db.people.toArray();
    const q = searchQuery.toLowerCase();
    return all
      .filter((p) =>
        p.id !== currentPersonId &&
        !linkedPersonIds.includes(p.id) &&
        (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, linkedPersonIds, currentPersonId], []);

  function addLink(id: string) {
    setLinkedPersonIds([...linkedPersonIds, id]);
    setSearchQuery('');
  }

  function removeLink(id: string) {
    setLinkedPersonIds(linkedPersonIds.filter((lid) => lid !== id));
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Linked People</h2>
      <div className={styles.fieldGroup}>
        {linkedPeople.length > 0 && (
          <div className={styles.arrayField}>
            {linkedPeople.map((p) => (
              <div key={p.id} className={styles.arrayItem}>
                <Avatar firstName={p.firstName} lastName={p.lastName} photoBlob={p.photoBlob} size={28} />
                <span style={{ flex: 1 }}>{p.firstName} {p.lastName}</span>
                <button type="button" className={styles.removeBtn} onClick={() => removeLink(p.id)}>&times;</button>
              </div>
            ))}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label}>Search to link someone</label>
          <input
            className={styles.input}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a name..."
          />
          {searchResults.length > 0 && (
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => addLink(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 8px' }}
                >
                  <Avatar firstName={p.firstName} lastName={p.lastName} size={22} />
                  {p.firstName} {p.lastName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

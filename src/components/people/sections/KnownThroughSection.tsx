import { useState } from 'react';
import { usePeople } from '../../../hooks/usePeople';
import { Avatar } from '../../ui/Avatar';
import type { KnownThrough } from '../../../models/types';
import styles from '../PersonForm.module.css';

interface KnownThroughSectionProps {
  knownThrough?: KnownThrough;
  setKnownThrough: (val: KnownThrough | undefined) => void;
  currentPersonId?: string;
}

export function KnownThroughSection({ knownThrough, setKnownThrough, currentPersonId }: KnownThroughSectionProps) {
  const allPeople = usePeople();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPerson = knownThrough
    ? allPeople.find((p) => p.id === knownThrough.personId)
    : null;

  const searchResults = searchQuery.length >= 2
    ? allPeople
        .filter((p) =>
          p.id !== currentPersonId &&
          p.id !== knownThrough?.personId &&
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  function selectPerson(id: string) {
    setKnownThrough({ personId: id, context: knownThrough?.context || '' });
    setSearchQuery('');
  }

  function clear() {
    setKnownThrough(undefined);
    setSearchQuery('');
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Known Through</h2>
      <div className={styles.fieldGroup}>
        {selectedPerson ? (
          <div className={styles.arrayItem}>
            <Avatar firstName={selectedPerson.firstName} lastName={selectedPerson.lastName} photoBlob={selectedPerson.photoBlob} size={28} />
            <span style={{ flex: 1 }}>{selectedPerson.firstName} {selectedPerson.lastName}</span>
            <button type="button" className={styles.removeBtn} onClick={clear}>&times;</button>
          </div>
        ) : (
          <div className={styles.field}>
            <label className={styles.label}>Who introduced you?</label>
            <input
              className={styles.input}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your directory..."
            />
            {searchResults.length > 0 && (
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.addItemBtn}
                    onClick={() => selectPerson(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 8px' }}
                  >
                    <Avatar firstName={p.firstName} lastName={p.lastName} size={22} />
                    {p.firstName} {p.lastName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {knownThrough && (
          <div className={styles.field}>
            <label className={styles.label}>Their relationship to that person</label>
            <input
              className={styles.input}
              type="text"
              value={knownThrough.context}
              onChange={(e) => setKnownThrough({ ...knownThrough, context: e.target.value })}
              placeholder='e.g. "her friend", "his coworker"'
            />
          </div>
        )}
      </div>
    </div>
  );
}

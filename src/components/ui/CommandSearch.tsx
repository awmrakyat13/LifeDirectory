import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeople } from '../../hooks/usePeople';
import { useSearch } from '../../hooks/useSearch';
import { Avatar } from './Avatar';
import styles from './CommandSearch.module.css';

export function useCommandSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return { open, setOpen };
}

interface CommandSearchProps {
  onClose: () => void;
}

export function CommandSearch({ onClose }: CommandSearchProps) {
  const navigate = useNavigate();
  const people = usePeople();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useSearch(people, query).slice(0, 8);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const go = useCallback((personId: string) => {
    onClose();
    navigate(`/people/${personId}`);
  }, [onClose, navigate]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex].id);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <span className={styles.searchIcon}>{'\u{1F50D}'}</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search people..."
          />
          <span className={styles.hint}>esc</span>
        </div>
        <div className={styles.results}>
          {query && results.length === 0 && (
            <div className={styles.empty}>No people found</div>
          )}
          {results.map((person, i) => (
            <div
              key={person.id}
              className={`${styles.resultItem} ${i === activeIndex ? styles.resultItemActive : ''}`}
              onClick={() => go(person.id)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={36} />
              <div className={styles.resultInfo}>
                <div className={styles.resultName}>
                  {person.firstName} {person.lastName}
                  {person.nickname && ` (${person.nickname})`}
                </div>
                <div className={styles.resultMeta}>
                  {[person.occupation, person.company].filter(Boolean).join(' at ') || person.relationshipLabel || ''}
                </div>
              </div>
            </div>
          ))}
          {!query && (
            <div className={styles.empty}>Type to search your directory</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePeople } from '../hooks/usePeople';
import { useCategories } from '../hooks/useCategories';
import { useSearch } from '../hooks/useSearch';
import { PersonCard } from '../components/people/PersonCard';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import styles from './PeoplePage.module.css';

export function PeoplePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { categories } = useCategories();
  const people = usePeople(selectedCategoryId);
  const filtered = useSearch(
    showFavoritesOnly ? people.filter((p) => p.isFavorite) : people,
    searchQuery
  );

  return (
    <div>
      <div className={styles.header}>
        <h1>People</h1>
        <Link to="/people/new" className={styles.addBtn}>+ Add Person</Link>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search people..."
        />
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${!selectedCategoryId && !showFavoritesOnly ? styles.filterActive : ''}`}
            onClick={() => { setSelectedCategoryId(undefined); setShowFavoritesOnly(false); }}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${showFavoritesOnly ? styles.filterActive : ''}`}
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setSelectedCategoryId(undefined); }}
          >
            {'\u2605'} Favorites
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${selectedCategoryId === cat.id ? styles.filterActive : ''}`}
              style={selectedCategoryId === cat.id ? { background: cat.color, color: 'white', borderColor: cat.color } : {}}
              onClick={() => { setSelectedCategoryId(selectedCategoryId === cat.id ? undefined : cat.id); setShowFavoritesOnly(false); }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matches found' : 'No people yet'}
          description={searchQuery ? 'Try a different search term.' : 'Add someone to your directory to get started.'}
          action={searchQuery ? undefined : { label: '+ Add Person', onClick: () => window.location.hash = '#/people/new' }}
        />
      ) : (
        <div className={styles.list}>
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      <div className={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'person' : 'people'}
      </div>
    </div>
  );
}

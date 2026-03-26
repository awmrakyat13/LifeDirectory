import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePeople } from '../hooks/usePeople';
import { useCategories } from '../hooks/useCategories';
import { useSearch } from '../hooks/useSearch';
import { PersonCard } from '../components/people/PersonCard';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { PersonCardSkeletonList } from '../components/ui/Skeleton';
import type { Person } from '../models/types';
import styles from './PeoplePage.module.css';

type SortKey = 'name' | 'recent' | 'added';

function sortPeople(people: Person[], sortBy: SortKey): Person[] {
  const sorted = [...people];
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    case 'recent':
      return sorted.sort((a, b) => {
        if (!a.lastInteractionDate && !b.lastInteractionDate) return 0;
        if (!a.lastInteractionDate) return 1;
        if (!b.lastInteractionDate) return -1;
        return b.lastInteractionDate.localeCompare(a.lastInteractionDate);
      });
    case 'added':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function PeoplePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const { categories } = useCategories();
  const people = usePeople(selectedCategoryId);

  const preFiltered = useMemo(
    () => (showFavoritesOnly ? people.filter((p) => p.isFavorite) : people),
    [people, showFavoritesOnly]
  );

  const searched = useSearch(preFiltered, searchQuery);
  const sorted = useMemo(() => sortPeople(searched, sortBy), [searched, sortBy]);

  const isLoading = people === undefined;

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
        <div className={styles.filterRow}>
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
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label="Sort by"
          >
            <option value="name">Name</option>
            <option value="recent">Last contacted</option>
            <option value="added">Recently added</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <PersonCardSkeletonList count={5} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matches found' : 'No people yet'}
          description={searchQuery ? 'Try a different search term.' : 'Add someone to your directory to get started.'}
          action={searchQuery ? undefined : { label: '+ Add Person', onClick: () => { window.location.hash = '#/people/new'; } }}
        />
      ) : (
        <div className={styles.list}>
          {sorted.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      <div className={styles.count}>
        {sorted.length} {sorted.length === 1 ? 'person' : 'people'}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import type { Person } from '../models/types';

export function useSearch(people: Person[], query: string) {
  return useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return people;

    return people.filter((p) => {
      const searchable = [
        p.firstName,
        p.lastName,
        p.nickname,
        p.company,
        p.occupation,
        p.relationshipLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [people, query]);
}

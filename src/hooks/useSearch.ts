import { useMemo } from 'react';
import type { Person } from '../models/types';
import { fuzzySearchPeople } from '../utils/search';

export function useSearch(people: Person[], query: string) {
  return useMemo(() => fuzzySearchPeople(people, query), [people, query]);
}

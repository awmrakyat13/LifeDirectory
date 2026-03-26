import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Person } from '../models/types';

export function usePeople(categoryId?: string) {
  const people = useLiveQuery(async () => {
    if (categoryId) {
      const joins = await db.personCategories
        .where('categoryId')
        .equals(categoryId)
        .toArray();
      const personIds = joins.map((j) => j.personId);
      if (personIds.length === 0) return [];
      return db.people.where('id').anyOf(personIds).toArray();
    }
    return db.people.orderBy('firstName').toArray();
  }, [categoryId], []);

  return people;
}

export function usePerson(id: string | undefined) {
  const person = useLiveQuery(
    () => (id ? db.people.get(id) : undefined),
    [id]
  );

  const categories = useLiveQuery(async () => {
    if (!id) return [];
    const joins = await db.personCategories.where('personId').equals(id).toArray();
    const catIds = joins.map((j) => j.categoryId);
    if (catIds.length === 0) return [];
    return db.categories.where('id').anyOf(catIds).toArray();
  }, [id], []);

  return { person, categories };
}

export function usePersonActions() {
  const addPerson = useCallback(async (
    data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
    categoryIds: string[]
  ) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.transaction('rw', [db.people, db.personCategories], async () => {
      await db.people.add({
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      });
      if (categoryIds.length > 0) {
        await db.personCategories.bulkAdd(
          categoryIds.map((catId) => ({
            id: crypto.randomUUID(),
            personId: id,
            categoryId: catId,
          }))
        );
      }
    });
    return id;
  }, []);

  const updatePerson = useCallback(async (
    id: string,
    data: Partial<Person>,
    categoryIds?: string[]
  ) => {
    await db.transaction('rw', [db.people, db.personCategories], async () => {
      await db.people.update(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      if (categoryIds !== undefined) {
        await db.personCategories.where('personId').equals(id).delete();
        if (categoryIds.length > 0) {
          await db.personCategories.bulkAdd(
            categoryIds.map((catId) => ({
              id: crypto.randomUUID(),
              personId: id,
              categoryId: catId,
            }))
          );
        }
      }
    });
  }, []);

  const deletePerson = useCallback(async (id: string) => {
    await db.transaction('rw', [db.people, db.personCategories, db.interactions], async () => {
      await db.interactions.where('personId').equals(id).delete();
      await db.personCategories.where('personId').equals(id).delete();
      await db.people.delete(id);
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const person = await db.people.get(id);
    if (person) {
      await db.people.update(id, { isFavorite: !person.isFavorite });
    }
  }, []);

  return { addPerson, updatePerson, deletePerson, toggleFavorite };
}

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Category } from '../models/types';

export function useCategories() {
  const categories = useLiveQuery(
    () => db.categories.orderBy('sortOrder').toArray(),
    [],
    []
  );

  const addCategory = useCallback(async (name: string, color: string) => {
    const maxOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sortOrder))
      : -1;
    await db.categories.add({
      id: crypto.randomUUID(),
      name,
      color,
      sortOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    });
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Pick<Category, 'name' | 'color'>>) => {
    await db.categories.update(id, updates);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await db.transaction('rw', [db.categories, db.personCategories], async () => {
      await db.personCategories.where('categoryId').equals(id).delete();
      await db.categories.delete(id);
    });
  }, []);

  const reorderCategories = useCallback(async (orderedIds: string[]) => {
    await db.transaction('rw', db.categories, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.categories.update(orderedIds[i], { sortOrder: i });
      }
    });
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory, reorderCategories };
}

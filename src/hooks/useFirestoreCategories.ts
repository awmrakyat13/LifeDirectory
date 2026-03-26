import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeCategories,
  addCategoryFs,
  updateCategoryFs,
  deleteCategoryFs,
} from '../firebase/firestore';
import type { Category } from '../models/types';

export function useFirestoreCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeCategories(user.uid, setCategories);
  }, [user]);

  const addCategory = useCallback(async (name: string, color: string) => {
    if (!user) return;
    const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder)) : -1;
    await addCategoryFs(user.uid, {
      id: crypto.randomUUID(),
      name,
      color,
      sortOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    });
  }, [user, categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Pick<Category, 'name' | 'color'>>) => {
    if (!user) return;
    await updateCategoryFs(user.uid, id, updates);
  }, [user]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;
    await deleteCategoryFs(user.uid, id);
  }, [user]);

  const reorderCategories = useCallback(async (orderedIds: string[]) => {
    if (!user) return;
    for (let i = 0; i < orderedIds.length; i++) {
      await updateCategoryFs(user.uid, orderedIds[i], { sortOrder: i });
    }
  }, [user]);

  return { categories, addCategory, updateCategory, deleteCategory, reorderCategories };
}

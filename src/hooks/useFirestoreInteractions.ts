import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeInteractions,
  addInteractionFs,
  deleteInteractionFs,
  updatePersonFs,
} from '../firebase/firestore';
import type { Interaction } from '../models/types';

export function useFirestoreInteractions(personId: string | undefined) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    if (!user || !personId) return;
    return subscribeInteractions(user.uid, personId, setInteractions);
  }, [user, personId]);

  const addInteraction = useCallback(
    async (data: { date: string; type: string; summary?: string }) => {
      if (!user || !personId) return;
      await addInteractionFs(user.uid, {
        id: crypto.randomUUID(),
        personId,
        date: data.date,
        type: data.type,
        summary: data.summary || undefined,
        createdAt: new Date().toISOString(),
      });
      await updatePersonFs(user.uid, personId, {
        lastInteractionDate: data.date,
        updatedAt: new Date().toISOString(),
      });
    },
    [user, personId]
  );

  const deleteInteraction = useCallback(async (id: string) => {
    if (!user) return;
    await deleteInteractionFs(user.uid, id);
  }, [user]);

  return { interactions, addInteraction, deleteInteraction };
}

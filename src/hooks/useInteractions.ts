import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useInteractions(personId: string | undefined) {
  const interactions = useLiveQuery(
    () =>
      personId
        ? db.interactions.where('personId').equals(personId).reverse().sortBy('date')
        : [],
    [personId],
    []
  );

  const addInteraction = useCallback(
    async (data: { date: string; type: string; summary?: string }) => {
      if (!personId) return;
      await db.transaction('rw', [db.interactions, db.people], async () => {
        await db.interactions.add({
          id: crypto.randomUUID(),
          personId,
          date: data.date,
          type: data.type,
          summary: data.summary || undefined,
          createdAt: new Date().toISOString(),
        });
        await db.people.update(personId, {
          lastInteractionDate: data.date,
          updatedAt: new Date().toISOString(),
        });
      });
    },
    [personId]
  );

  const deleteInteraction = useCallback(async (id: string) => {
    await db.interactions.delete(id);
  }, []);

  return { interactions, addInteraction, deleteInteraction };
}

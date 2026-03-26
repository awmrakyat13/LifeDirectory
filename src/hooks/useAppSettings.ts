import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { AppSettings } from '../models/types';

export function useAppSettings() {
  const settings = useLiveQuery(() => db.settings.get('singleton'));

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    await db.settings.update('singleton', updates);
  }, []);

  return { settings, updateSettings };
}

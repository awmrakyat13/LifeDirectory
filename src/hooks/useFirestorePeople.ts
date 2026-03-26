import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribePeople,
  subscribePersonCategories,
  addPersonFs,
  updatePersonFs,
  deletePersonFs,
  addPersonCategoryFs,
  deletePersonCategoriesForPerson,
} from '../firebase/firestore';
import { upsertMatchHint, deleteMatchHintsForPerson } from '../firebase/matchHints';
import { updateCircleSnapshot, buildCircleEntries } from '../firebase/circleSnapshot';
import type { Person, PersonCategory } from '../models/types';

export function useFirestorePeople(categoryId?: string) {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [personCategories, setPersonCategories] = useState<PersonCategory[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribePeople(user.uid, (p) => {
      setPeople(p);
      // Sync circle snapshot for linked users to see
      updateCircleSnapshot(user.uid, buildCircleEntries(p)).catch(() => {});
    });
    const unsub2 = subscribePersonCategories(user.uid, setPersonCategories);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const filtered = categoryId
    ? (() => {
        const personIds = new Set(personCategories.filter((pc) => pc.categoryId === categoryId).map((pc) => pc.personId));
        return people.filter((p) => personIds.has(p.id));
      })()
    : people;

  return filtered;
}

export function useFirestorePerson(id: string | undefined) {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [personCategories, setPersonCategories] = useState<PersonCategory[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribePeople(user.uid, setPeople);
    const unsub2 = subscribePersonCategories(user.uid, setPersonCategories);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const person = id ? people.find((p) => p.id === id) : undefined;

  const categories_data = useFirestoreCategories_internal(user?.uid);
  const personCatIds = personCategories.filter((pc) => pc.personId === id).map((pc) => pc.categoryId);
  const categories = categories_data.filter((c) => personCatIds.includes(c.id));

  return { person, categories };
}

// Internal helper to avoid circular imports
import { subscribeCategories } from '../firebase/firestore';
import type { Category } from '../models/types';

function useFirestoreCategories_internal(uid: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    if (!uid) return;
    return subscribeCategories(uid, setCategories);
  }, [uid]);
  return categories;
}

export function useFirestorePersonActions() {
  const { user } = useAuth();

  const addPerson = useCallback(async (
    data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
    categoryIds: string[]
  ) => {
    if (!user) return '';
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const person: Person = { ...data, id, createdAt: now, updatedAt: now };
    await addPersonFs(user.uid, person);
    for (const catId of categoryIds) {
      await addPersonCategoryFs(user.uid, {
        id: crypto.randomUUID(),
        personId: id,
        categoryId: catId,
      });
    }
    // Create match hints for email/phone
    await syncMatchHints(user.uid, id, `${data.firstName} ${data.lastName}`, data.emails, data.phones);
    return id;
  }, [user]);

  const updatePerson = useCallback(async (
    id: string,
    data: Partial<Person>,
    categoryIds?: string[]
  ) => {
    if (!user) return;
    await updatePersonFs(user.uid, id, { ...data, updatedAt: new Date().toISOString() });
    if (categoryIds !== undefined) {
      await deletePersonCategoriesForPerson(user.uid, id);
      for (const catId of categoryIds) {
        await addPersonCategoryFs(user.uid, {
          id: crypto.randomUUID(),
          personId: id,
          categoryId: catId,
        });
      }
    }
  }, [user]);

  const deletePerson = useCallback(async (id: string) => {
    if (!user) return;
    await deleteMatchHintsForPerson(user.uid, id);
    await deletePersonFs(user.uid, id);
  }, [user]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user) return;
    // Need to get current state - we'll read from Firestore
    const { getDoc } = await import('firebase/firestore');
    const { doc } = await import('firebase/firestore');
    const { firestore } = await import('../firebase/config');
    const snap = await getDoc(doc(firestore, 'users', user.uid, 'people', id));
    if (snap.exists()) {
      const current = snap.data() as Person;
      await updatePersonFs(user.uid, id, { isFavorite: !current.isFavorite });
    }
  }, [user]);

  return { addPerson, updatePerson, deletePerson, toggleFavorite };
}

async function syncMatchHints(
  ownerUid: string,
  personId: string,
  personName: string,
  emails?: { label: string; value: string }[],
  phones?: { label: string; value: string }[]
) {
  // Delete old hints for this person, then create fresh ones
  await deleteMatchHintsForPerson(ownerUid, personId);

  const primaryEmail = emails?.[0]?.value?.toLowerCase().trim();
  if (primaryEmail) {
    await upsertMatchHint({
      id: `${ownerUid}-${personId}-email`,
      ownerUid,
      personId,
      personName,
      email: primaryEmail,
    });
  }

  const primaryPhone = phones?.[0]?.value?.trim();
  if (primaryPhone) {
    await upsertMatchHint({
      id: `${ownerUid}-${personId}-phone`,
      ownerUid,
      personId,
      personName,
      phone: primaryPhone,
    });
  }
}

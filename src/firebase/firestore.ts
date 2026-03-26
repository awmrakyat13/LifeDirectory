import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './config';
import type { Person, Category, PersonCategory, Interaction } from '../models/types';

// ---- User Profile ----

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  birthday?: string;
  occupation?: string;
  company?: string;
  interests?: string[];
  languages?: string[];
  createdAt: string;
}

export interface PublicProfile {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
}

function userDoc(uid: string) {
  return doc(firestore, 'users', uid);
}

function userCollection(uid: string, name: string) {
  return collection(firestore, 'users', uid, name);
}

export async function createUserProfile(uid: string, profile: UserProfile) {
  await setDoc(userDoc(uid), { profile });
  // Store public profile in top-level searchable collection
  await setDoc(doc(firestore, 'publicProfiles', uid), {
    uid,
    email: profile.email,
    name: profile.name,
    photoUrl: profile.photoUrl || undefined,
  } satisfies PublicProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  return snap.data().profile as UserProfile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const current = await getUserProfile(uid);
  if (!current) return;
  const merged = { ...current, ...updates };
  await setDoc(userDoc(uid), { profile: merged }, { merge: true });
  // Update public profile if name/photo changed
  if (updates.name || updates.photoUrl !== undefined) {
    await setDoc(doc(firestore, 'publicProfiles', uid), {
      uid,
      email: merged.email,
      name: merged.name,
      photoUrl: merged.photoUrl || null,
    }, { merge: true });
  }
}

export async function findUserByEmail(email: string): Promise<PublicProfile | null> {
  const q = query(collection(firestore, 'publicProfiles'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as PublicProfile;
}

// ---- People CRUD ----

export async function addPersonFs(uid: string, person: Person) {
  await setDoc(doc(userCollection(uid, 'people'), person.id), person);
}

export async function updatePersonFs(uid: string, personId: string, updates: Partial<Person>) {
  await updateDoc(doc(userCollection(uid, 'people'), personId), updates);
}

export async function deletePersonFs(uid: string, personId: string) {
  await deleteDoc(doc(userCollection(uid, 'people'), personId));
  // Also delete related personCategories and interactions
  const pcSnap = await getDocs(query(userCollection(uid, 'personCategories'), where('personId', '==', personId)));
  for (const d of pcSnap.docs) await deleteDoc(d.ref);
  const intSnap = await getDocs(query(userCollection(uid, 'interactions'), where('personId', '==', personId)));
  for (const d of intSnap.docs) await deleteDoc(d.ref);
}

export function subscribePeople(uid: string, callback: (people: Person[]) => void): Unsubscribe {
  return onSnapshot(userCollection(uid, 'people'), (snap) => {
    const people = snap.docs.map((d) => d.data() as Person);
    callback(people);
  });
}

// ---- Categories CRUD ----

export async function addCategoryFs(uid: string, category: Category) {
  await setDoc(doc(userCollection(uid, 'categories'), category.id), category);
}

export async function updateCategoryFs(uid: string, catId: string, updates: Partial<Category>) {
  await updateDoc(doc(userCollection(uid, 'categories'), catId), updates);
}

export async function deleteCategoryFs(uid: string, catId: string) {
  await deleteDoc(doc(userCollection(uid, 'categories'), catId));
  const pcSnap = await getDocs(query(userCollection(uid, 'personCategories'), where('categoryId', '==', catId)));
  for (const d of pcSnap.docs) await deleteDoc(d.ref);
}

export function subscribeCategories(uid: string, callback: (categories: Category[]) => void): Unsubscribe {
  return onSnapshot(query(userCollection(uid, 'categories'), orderBy('sortOrder')), (snap) => {
    callback(snap.docs.map((d) => d.data() as Category));
  });
}

// ---- PersonCategories ----

export async function addPersonCategoryFs(uid: string, pc: PersonCategory) {
  await setDoc(doc(userCollection(uid, 'personCategories'), pc.id), pc);
}

export async function deletePersonCategoriesForPerson(uid: string, personId: string) {
  const snap = await getDocs(query(userCollection(uid, 'personCategories'), where('personId', '==', personId)));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

export function subscribePersonCategories(uid: string, callback: (pcs: PersonCategory[]) => void): Unsubscribe {
  return onSnapshot(userCollection(uid, 'personCategories'), (snap) => {
    callback(snap.docs.map((d) => d.data() as PersonCategory));
  });
}

// ---- Interactions ----

export async function addInteractionFs(uid: string, interaction: Interaction) {
  await setDoc(doc(userCollection(uid, 'interactions'), interaction.id), interaction);
}

export async function deleteInteractionFs(uid: string, interactionId: string) {
  await deleteDoc(doc(userCollection(uid, 'interactions'), interactionId));
}

export function subscribeInteractions(uid: string, personId: string, callback: (interactions: Interaction[]) => void): Unsubscribe {
  return onSnapshot(
    query(userCollection(uid, 'interactions'), where('personId', '==', personId)),
    (snap) => {
      const interactions = snap.docs.map((d) => d.data() as Interaction);
      callback(interactions.sort((a, b) => b.date.localeCompare(a.date)));
    }
  );
}

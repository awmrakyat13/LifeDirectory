import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from './config';
import type { CircleEntry } from '../utils/orbitCalculator';

export async function updateCircleSnapshot(uid: string, entries: CircleEntry[]) {
  await setDoc(doc(firestore, 'users', uid, 'meta', 'circle'), { people: entries });
}

export async function getCircleSnapshot(uid: string): Promise<CircleEntry[]> {
  const snap = await getDoc(doc(firestore, 'users', uid, 'meta', 'circle'));
  if (!snap.exists()) return [];
  return (snap.data().people ?? []) as CircleEntry[];
}

export function buildCircleEntries(
  people: { firstName: string; lastName: string; id: string }[]
): CircleEntry[] {
  return people.map((p) => ({
    display: `${p.firstName} ${p.lastName.charAt(0) || ''}.`.trim(),
    isOnPlatform: p.id.startsWith('autolinked-'),
  }));
}

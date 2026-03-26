import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from './config';

export interface MatchHint {
  id: string;
  ownerUid: string;
  personId: string;
  personName: string;
  email?: string;
  phone?: string;
}

const hintsCol = collection(firestore, 'matchHints');

export async function upsertMatchHint(hint: MatchHint) {
  await setDoc(doc(hintsCol, hint.id), hint);
}

export async function deleteMatchHint(hintId: string) {
  await deleteDoc(doc(hintsCol, hintId));
}

export async function deleteMatchHintsForPerson(ownerUid: string, personId: string) {
  const snap = await getDocs(
    query(hintsCol, where('ownerUid', '==', ownerUid), where('personId', '==', personId))
  );
  for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function findMatchesByEmail(email: string): Promise<MatchHint[]> {
  const snap = await getDocs(query(hintsCol, where('email', '==', email.toLowerCase())));
  return snap.docs.map((d) => d.data() as MatchHint);
}

export async function findMatchesByPhone(phone: string): Promise<MatchHint[]> {
  const snap = await getDocs(query(hintsCol, where('phone', '==', phone)));
  return snap.docs.map((d) => d.data() as MatchHint);
}

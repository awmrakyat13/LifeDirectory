import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './config';

export interface ConnectionRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromEmail: string;
  toUid: string;
  toName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Connection {
  id: string;
  uid1: string;
  uid2: string;
  connectedAt: string;
}

const requestsCol = collection(firestore, 'connectionRequests');
const connectionsCol = collection(firestore, 'connections');

export async function sendConnectionRequest(req: ConnectionRequest) {
  await setDoc(doc(requestsCol, req.id), req);
}

export async function acceptConnectionRequest(requestId: string) {
  await updateDoc(doc(requestsCol, requestId), { status: 'accepted' });
}

export async function declineConnectionRequest(requestId: string) {
  await updateDoc(doc(requestsCol, requestId), { status: 'declined' });
}

export async function createConnection(conn: Connection) {
  await setDoc(doc(connectionsCol, conn.id), conn);
}

export function subscribeIncomingRequests(uid: string, callback: (reqs: ConnectionRequest[]) => void): Unsubscribe {
  return onSnapshot(
    query(requestsCol, where('toUid', '==', uid), where('status', '==', 'pending')),
    (snap) => callback(snap.docs.map((d) => d.data() as ConnectionRequest))
  );
}

export function subscribeOutgoingRequests(uid: string, callback: (reqs: ConnectionRequest[]) => void): Unsubscribe {
  return onSnapshot(
    query(requestsCol, where('fromUid', '==', uid)),
    (snap) => callback(snap.docs.map((d) => d.data() as ConnectionRequest))
  );
}

export async function getConnections(uid: string): Promise<Connection[]> {
  const q1 = await getDocs(query(connectionsCol, where('uid1', '==', uid)));
  const q2 = await getDocs(query(connectionsCol, where('uid2', '==', uid)));
  return [...q1.docs, ...q2.docs].map((d) => d.data() as Connection);
}

export function subscribeConnections(uid: string, callback: (conns: Connection[]) => void): Unsubscribe {
  // Subscribe to both sides
  const unsub1 = onSnapshot(query(connectionsCol, where('uid1', '==', uid)), () => {
    getConnections(uid).then(callback);
  });
  const unsub2 = onSnapshot(query(connectionsCol, where('uid2', '==', uid)), () => {
    getConnections(uid).then(callback);
  });
  return () => { unsub1(); unsub2(); };
}

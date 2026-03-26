import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeIncomingRequests,
  subscribeOutgoingRequests,
  subscribeConnections,
  sendConnectionRequest,
  acceptConnectionRequest as acceptReq,
  declineConnectionRequest as declineReq,
  createConnection,
  type ConnectionRequest,
  type Connection,
} from '../firebase/connections';
import {
  findUserByEmail,
  getUserProfile,
  addPersonFs,
  type UserProfile,
  type PublicProfile,
} from '../firebase/firestore';
import type { Person } from '../models/types';

export function useConnections() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeIncomingRequests(user.uid, setIncoming);
    const unsub2 = subscribeOutgoingRequests(user.uid, setOutgoing);
    const unsub3 = subscribeConnections(user.uid, setConnections);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user]);

  const searchByEmail = useCallback(async (email: string): Promise<PublicProfile | null> => {
    if (!user || email === user.email) return null;
    return findUserByEmail(email);
  }, [user]);

  const sendRequest = useCallback(async (target: PublicProfile) => {
    if (!user) return;
    const myProfile = await getUserProfile(user.uid);
    const req: ConnectionRequest = {
      id: crypto.randomUUID(),
      fromUid: user.uid,
      fromName: myProfile?.name || user.email || 'Unknown',
      fromEmail: user.email || '',
      toUid: target.uid,
      toName: target.name,
      toEmail: target.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await sendConnectionRequest(req);
  }, [user]);

  const acceptRequest = useCallback(async (request: ConnectionRequest) => {
    if (!user) return;
    await acceptReq(request.id);

    // Create bidirectional connection
    await createConnection({
      id: crypto.randomUUID(),
      uid1: request.fromUid,
      uid2: request.toUid,
      connectedAt: new Date().toISOString(),
    });

    // Pull the requester's full profile into my directory as a Person
    const theirProfile = await getUserProfile(request.fromUid);
    if (theirProfile) {
      await addProfileAsPerson(user.uid, theirProfile);
    }

    // Also add my profile to their directory
    const myProfile = await getUserProfile(user.uid);
    if (myProfile) {
      await addProfileAsPerson(request.fromUid, myProfile);
    }
  }, [user]);

  const declineRequest = useCallback(async (requestId: string) => {
    await declineReq(requestId);
  }, []);

  return {
    incoming,
    outgoing,
    connections,
    searchByEmail,
    sendRequest,
    acceptRequest,
    declineRequest,
  };
}

async function addProfileAsPerson(ownerUid: string, profile: UserProfile) {
  const now = new Date().toISOString();
  const person: Person = {
    id: `connected-${profile.uid}`,
    firstName: profile.name.split(' ')[0] || profile.name,
    lastName: profile.name.split(' ').slice(1).join(' ') || '',
    nickname: undefined,
    photoBlob: undefined,
    relationshipLabel: 'Connected',
    birthday: profile.birthday,
    occupation: profile.occupation,
    company: profile.company,
    interests: profile.interests,
    languages: profile.languages,
    phones: profile.phone ? [{ label: 'Mobile', value: profile.phone }] : undefined,
    emails: [{ label: 'Email', value: profile.email }],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
  await addPersonFs(ownerUid, person);
}

import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { getUserProfile, addPersonFs, updatePersonFs } from '../firebase/firestore';
import { findMatchesByEmail, deleteMatchHint } from '../firebase/matchHints';
import { useToast } from '../components/ui/Toast';
import type { Person } from '../models/types';

export function useAutoLink() {
  const { user } = useAuth();
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user?.email || hasRun.current) return;
    hasRun.current = true;

    runAutoLink(user.uid, user.email).then((count) => {
      if (count > 0) {
        toast(`Linked with ${count} ${count === 1 ? 'person' : 'people'} who know you`, 'success');
      }
    });
  }, [user, toast]);
}

async function runAutoLink(myUid: string, myEmail: string): Promise<number> {
  // Find everyone who added my email to their directory
  const matches = await findMatchesByEmail(myEmail.toLowerCase());
  if (matches.length === 0) return 0;

  const myProfile = await getUserProfile(myUid);
  let linked = 0;

  for (const hint of matches) {
    // Skip if the hint is from myself
    if (hint.ownerUid === myUid) continue;

    try {
      // 1. Update the owner's existing person entry with my basic info
      const updates: Partial<Person> = {
        linkedPersonIds: [`autolinked-${myUid}`],
        updatedAt: new Date().toISOString(),
      };

      // Only enrich with the agreed shared fields
      if (myProfile) {
        const nameParts = myProfile.name.split(' ');
        updates.firstName = nameParts[0] || myProfile.name;
        updates.lastName = nameParts.slice(1).join(' ') || '';
        if (myProfile.birthday) updates.birthday = myProfile.birthday;
        // Anniversary is on the UserProfile type but may not be there yet
        // photoUrl can't be stored as photoBlob easily, skip for now
      }

      await updatePersonFs(hint.ownerUid, hint.personId, updates);

      // 2. Add the owner as a Person in MY directory (basic info only)
      const ownerProfile = await getUserProfile(hint.ownerUid);
      if (ownerProfile) {
        const now = new Date().toISOString();
        const personEntry: Person = {
          id: `autolinked-${hint.ownerUid}`,
          firstName: ownerProfile.name.split(' ')[0] || ownerProfile.name,
          lastName: ownerProfile.name.split(' ').slice(1).join(' ') || '',
          birthday: ownerProfile.birthday,
          emails: [{ label: 'Email', value: ownerProfile.email }],
          linkedPersonIds: [hint.personId],
          isFavorite: false,
          createdAt: now,
          updatedAt: now,
        };
        await addPersonFs(myUid, personEntry);
      }

      // 3. Consume the match hint
      await deleteMatchHint(hint.id);
      linked++;
    } catch {
      // Skip failures silently — hint stays for retry on next login
    }
  }

  return linked;
}

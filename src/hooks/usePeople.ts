import { useFirestorePeople, useFirestorePerson, useFirestorePersonActions } from './useFirestorePeople';

// Re-export Firestore-backed hooks under the original names
export const usePeople = useFirestorePeople;
export const usePerson = useFirestorePerson;
export const usePersonActions = useFirestorePersonActions;

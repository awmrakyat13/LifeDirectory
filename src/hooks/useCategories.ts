import { useFirestoreCategories } from './useFirestoreCategories';

// Re-export Firestore-backed hook under the original name
export const useCategories = useFirestoreCategories;

import { getDocs } from 'firebase/firestore';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from './config';

const defaultCategories = [
  { name: 'Family', color: '#E74C3C', sortOrder: 0 },
  { name: 'Friends', color: '#3498DB', sortOrder: 1 },
  { name: 'Work', color: '#2ECC71', sortOrder: 2 },
  { name: 'Neighbors', color: '#F39C12', sortOrder: 3 },
  { name: 'Acquaintances', color: '#9B59B6', sortOrder: 4 },
  { name: 'School', color: '#1ABC9C', sortOrder: 5 },
  { name: 'Community', color: '#E67E22', sortOrder: 6 },
  { name: 'Service Providers', color: '#34495E', sortOrder: 7 },
];

export async function seedUserCategories(uid: string) {
  const categoriesCol = collection(firestore, 'users', uid, 'categories');
  const existing = await getDocs(categoriesCol);
  if (existing.size > 0) return; // Already seeded

  const now = new Date().toISOString();
  for (const cat of defaultCategories) {
    const id = crypto.randomUUID();
    await setDoc(doc(categoriesCol, id), {
      id,
      ...cat,
      createdAt: now,
    });
  }
}

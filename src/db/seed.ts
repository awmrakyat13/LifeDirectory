import { db } from './database';

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

const defaultSettings = {
  id: 'singleton' as const,
  theme: 'system' as const,
  nudgeDays: 30,
};

export async function seedDatabase() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const now = new Date().toISOString();
    await db.categories.bulkAdd(
      defaultCategories.map((c) => ({
        ...c,
        id: crypto.randomUUID(),
        createdAt: now,
      }))
    );
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add(defaultSettings);
  }
}

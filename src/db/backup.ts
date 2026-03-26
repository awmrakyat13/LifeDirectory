import { db } from './database';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

export async function exportData(): Promise<void> {
  const people = await db.people.toArray();
  const categories = await db.categories.toArray();
  const personCategories = await db.personCategories.toArray();
  const interactions = await db.interactions.toArray();
  const settings = await db.settings.toArray();

  const serializedPeople = await Promise.all(
    people.map(async (p) => ({
      ...p,
      photoBlob: p.photoBlob ? await blobToBase64(p.photoBlob) : undefined,
    }))
  );

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      people: serializedPeople,
      categories,
      personCategories,
      interactions,
      settings,
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-directory-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const backup = JSON.parse(text);

  if (!backup.version || !backup.data) {
    throw new Error('Invalid backup file');
  }

  const { people, categories, personCategories, interactions, settings } = backup.data;

  const restoredPeople = people.map((p: Record<string, unknown>) => ({
    ...p,
    photoBlob: typeof p.photoBlob === 'string' ? base64ToBlob(p.photoBlob) : undefined,
  }));

  await db.transaction('rw', [db.people, db.categories, db.personCategories, db.interactions, db.settings], async () => {
    await db.people.clear();
    await db.categories.clear();
    await db.personCategories.clear();
    await db.interactions.clear();
    await db.settings.clear();

    await db.people.bulkAdd(restoredPeople);
    await db.categories.bulkAdd(categories);
    await db.personCategories.bulkAdd(personCategories);
    await db.interactions.bulkAdd(interactions);
    await db.settings.bulkAdd(settings);
  });
}

export async function previewImport(file: File): Promise<{ people: number; categories: number; interactions: number }> {
  const text = await file.text();
  const backup = JSON.parse(text);
  if (!backup.version || !backup.data) throw new Error('Invalid backup file');
  return {
    people: backup.data.people?.length ?? 0,
    categories: backup.data.categories?.length ?? 0,
    interactions: backup.data.interactions?.length ?? 0,
  };
}

export async function exportCategory(categoryId: string): Promise<void> {
  const joins = await db.personCategories.where('categoryId').equals(categoryId).toArray();
  const personIds = joins.map((j) => j.personId);
  if (personIds.length === 0) {
    throw new Error('No people in this category');
  }
  const people = await db.people.where('id').anyOf(personIds).toArray();
  const category = await db.categories.get(categoryId);
  const interactions = await db.interactions.where('personId').anyOf(personIds).toArray();
  const relatedJoins = await db.personCategories.where('personId').anyOf(personIds).toArray();
  const relatedCatIds = [...new Set(relatedJoins.map((j) => j.categoryId))];
  const categories = await db.categories.where('id').anyOf(relatedCatIds).toArray();

  const serializedPeople = await Promise.all(
    people.map(async (p) => ({
      ...p,
      photoBlob: p.photoBlob ? await blobToBase64(p.photoBlob) : undefined,
    }))
  );

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      people: serializedPeople,
      categories,
      personCategories: relatedJoins,
      interactions,
      settings: [],
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-directory-${category?.name ?? 'category'}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

import Dexie, { type Table } from 'dexie';
import type { Person, Category, PersonCategory, Interaction, AppSettings } from '../models/types';

export class LifeDirectoryDB extends Dexie {
  people!: Table<Person>;
  categories!: Table<Category>;
  personCategories!: Table<PersonCategory>;
  interactions!: Table<Interaction>;
  settings!: Table<AppSettings>;

  constructor() {
    super('LifeDirectoryDB');

    this.version(1).stores({
      people: 'id, firstName, lastName, isFavorite, lastInteractionDate, createdAt, updatedAt',
      categories: 'id, name, sortOrder',
      personCategories: 'id, personId, categoryId, [personId+categoryId]',
      interactions: 'id, personId, date, createdAt',
      settings: 'id',
    });

    // v2: adds myName, myPhotoBlob to settings (non-indexed fields, no schema change)
    this.version(2).stores({});
  }
}

export const db = new LifeDirectoryDB();

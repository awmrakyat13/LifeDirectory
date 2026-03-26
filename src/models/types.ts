export interface NamedDate {
  label: string;
  date: string;
}

export interface Child {
  name: string;
  birthYear?: number;
}

export interface Pet {
  name: string;
  type?: string;
}

export interface ContactEntry {
  label: string;
  value: string;
}

export interface SocialMediaEntry {
  platform: string;
  handle: string;
}

export interface Person {
  id: string;

  // Identity
  firstName: string;
  lastName: string;
  nickname?: string;
  photoBlob?: Blob;
  relationshipLabel?: string;
  howWeMet?: string;

  // Key Dates
  birthday?: string;
  anniversary?: string;
  customDates?: NamedDate[];

  // Family & Connections
  spousePartner?: string;
  children?: Child[];
  pets?: Pet[];
  linkedPersonIds?: string[];

  // Work & Life
  occupation?: string;
  company?: string;
  interests?: string[];
  dietaryRestrictions?: string[];
  languages?: string[];

  // Contact
  phones?: ContactEntry[];
  emails?: ContactEntry[];
  socialMedia?: SocialMediaEntry[];
  address?: string;

  // Conversation Memory
  lastInteractionDate?: string;
  lifeUpdates?: string;
  topicsToBringUp?: string[];
  giftIdeas?: string[];
  sensitiveTopics?: string[];
  notes?: string;

  // Meta
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface PersonCategory {
  id: string;
  personId: string;
  categoryId: string;
}

export interface Interaction {
  id: string;
  personId: string;
  date: string;
  type: string;
  summary?: string;
  createdAt: string;
}

export interface AppSettings {
  id: 'singleton';
  theme: 'light' | 'dark' | 'system';
  nudgeDays: number;
  defaultCategoryId?: string;
}

import type { Person, Category, PersonCategory } from '../models/types';
import { SOLAR } from '../constants/solarSystem';
import { daysSince } from './date';

export interface OrbitNode {
  id: string;
  label: string;
  photoBlob?: Blob;
  ring: number;
  angle: number;
  x: number;
  y: number;
  categoryColor?: string;
  isFavorite: boolean;
  isOnPlatform: boolean;
  isReadOnly: boolean;
  daysSinceContact: number | null;
}

export interface OrbitRing {
  ring: number;
  radius: number;
  label: string;
  color: string;
}

export interface ConnectionLine {
  fromId: string;
  toId: string;
  type: 'linked' | 'company';
  label?: string;
}

export interface OrbitLayout {
  center: OrbitNode;
  rings: OrbitRing[];
  nodes: OrbitNode[];
  connections: ConnectionLine[];
}

export interface OrbitInput {
  people: Person[];
  categories: Category[];
  personCategories: PersonCategory[];
  centerPersonId: 'me' | string;
  myName?: string;
  myPhotoBlob?: Blob;
}

function interactionSort(a: Person, b: Person): number {
  if (!a.lastInteractionDate && !b.lastInteractionDate) return 0;
  if (!a.lastInteractionDate) return 1;
  if (!b.lastInteractionDate) return -1;
  return b.lastInteractionDate.localeCompare(a.lastInteractionDate);
}

function positionOnRing(index: number, count: number, ringRadius: number): { angle: number; x: number; y: number } {
  if (count === 0) return { angle: 0, x: 0, y: 0 };
  const angle = -Math.PI / 2 + (index / count) * 2 * Math.PI;
  return {
    angle,
    x: ringRadius * Math.cos(angle),
    y: ringRadius * Math.sin(angle),
  };
}

function makeNode(person: Person, ring: number, pos: { angle: number; x: number; y: number }, categoryColor?: string): OrbitNode {
  return {
    id: person.id,
    label: `${person.firstName} ${person.lastName}`,
    photoBlob: person.photoBlob,
    ring,
    angle: pos.angle,
    x: pos.x,
    y: pos.y,
    categoryColor,
    isFavorite: person.isFavorite,
    isOnPlatform: person.id.startsWith('autolinked-'),
    isReadOnly: false,
    daysSinceContact: person.lastInteractionDate ? daysSince(person.lastInteractionDate) : null,
  };
}

function computeConnectionLines(visibleIds: Set<string>, people: Person[]): ConnectionLine[] {
  const connections: ConnectionLine[] = [];
  const seen = new Set<string>();

  for (const person of people) {
    if (!visibleIds.has(person.id)) continue;

    // Explicit links
    for (const linkedId of person.linkedPersonIds ?? []) {
      if (!visibleIds.has(linkedId)) continue;
      const key = [person.id, linkedId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      connections.push({ fromId: person.id, toId: linkedId, type: 'linked' });
    }
  }

  // Same company
  const companyMap = new Map<string, string[]>();
  for (const person of people) {
    if (!visibleIds.has(person.id) || !person.company) continue;
    const key = person.company.toLowerCase().trim();
    if (!companyMap.has(key)) companyMap.set(key, []);
    companyMap.get(key)!.push(person.id);
  }
  for (const [company, ids] of companyMap) {
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        connections.push({ fromId: ids[i], toId: ids[j], type: 'company', label: company });
      }
    }
  }

  return connections;
}

function computeMeCenter(input: OrbitInput): OrbitLayout {
  const { people, categories, personCategories, myName, myPhotoBlob } = input;

  const center: OrbitNode = {
    id: 'me',
    label: myName || 'Me',
    photoBlob: myPhotoBlob,
    ring: 0,
    angle: 0,
    x: 0,
    y: 0,
    isFavorite: false,
    isOnPlatform: true,
    isReadOnly: false,
    daysSinceContact: null,
  };

  // Build category lookup
  const personCatMap = new Map<string, string[]>();
  for (const pc of personCategories) {
    if (!personCatMap.has(pc.personId)) personCatMap.set(pc.personId, []);
    personCatMap.get(pc.personId)!.push(pc.categoryId);
  }
  const categoryMap = new Map<string, Category>();
  for (const c of categories) categoryMap.set(c.id, c);

  // Find primary category for each person (lowest sortOrder)
  function primaryCategory(personId: string): Category | undefined {
    const catIds = personCatMap.get(personId) ?? [];
    let best: Category | undefined;
    for (const cid of catIds) {
      const cat = categoryMap.get(cid);
      if (cat && (!best || cat.sortOrder < best.sortOrder)) best = cat;
    }
    return best;
  }

  const placed = new Set<string>();
  const nodes: OrbitNode[] = [];
  const rings: OrbitRing[] = [];
  let ringNum = 1;

  // Ring 1: Favorites
  const favorites = people.filter((p) => p.isFavorite).sort(interactionSort);
  if (favorites.length > 0) {
    const radius = SOLAR.BASE_RADIUS;
    rings.push({ ring: ringNum, radius, label: 'Favorites', color: '#F39C12' });
    favorites.forEach((p, i) => {
      const pos = positionOnRing(i, favorites.length, radius);
      const pc = primaryCategory(p.id);
      nodes.push(makeNode(p, ringNum, pos, pc?.color));
      placed.add(p.id);
    });
    ringNum++;
  }

  // Ring 2+: By category sortOrder
  for (const cat of categories) {
    const catPeople = people
      .filter((p) => {
        if (placed.has(p.id)) return false;
        const pc = primaryCategory(p.id);
        return pc?.id === cat.id;
      })
      .sort(interactionSort);

    if (catPeople.length === 0) continue;

    const radius = SOLAR.BASE_RADIUS + (ringNum - 1) * SOLAR.RING_SPACING;
    rings.push({ ring: ringNum, radius, label: cat.name, color: cat.color });
    catPeople.forEach((p, i) => {
      const pos = positionOnRing(i, catPeople.length, radius);
      nodes.push(makeNode(p, ringNum, pos, cat.color));
      placed.add(p.id);
    });
    ringNum++;
  }

  // Final ring: Uncategorized
  const uncategorized = people.filter((p) => !placed.has(p.id)).sort(interactionSort);
  if (uncategorized.length > 0) {
    const radius = SOLAR.BASE_RADIUS + (ringNum - 1) * SOLAR.RING_SPACING;
    rings.push({ ring: ringNum, radius, label: 'Other', color: '#888888' });
    uncategorized.forEach((p, i) => {
      const pos = positionOnRing(i, uncategorized.length, radius);
      nodes.push(makeNode(p, ringNum, pos, '#888888'));
      placed.add(p.id);
    });
  }

  const visibleIds = new Set(nodes.map((n) => n.id));
  const connections = computeConnectionLines(visibleIds, people);

  return { center, rings, nodes, connections };
}

function computeDrillDown(input: OrbitInput): OrbitLayout {
  const { people, categories, personCategories, centerPersonId } = input;

  const centerPerson = people.find((p) => p.id === centerPersonId);
  if (!centerPerson) return computeMeCenter(input);

  const center: OrbitNode = {
    id: centerPerson.id,
    label: `${centerPerson.firstName} ${centerPerson.lastName}`,
    photoBlob: centerPerson.photoBlob,
    ring: 0,
    angle: 0,
    x: 0,
    y: 0,
    isFavorite: centerPerson.isFavorite,
    isOnPlatform: centerPerson.id.startsWith('autolinked-'),
    isReadOnly: false,
    daysSinceContact: centerPerson.lastInteractionDate ? daysSince(centerPerson.lastInteractionDate) : null,
  };

  // Build category lookup
  const personCatMap = new Map<string, string[]>();
  for (const pc of personCategories) {
    if (!personCatMap.has(pc.personId)) personCatMap.set(pc.personId, []);
    personCatMap.get(pc.personId)!.push(pc.categoryId);
  }
  const categoryMap = new Map<string, Category>();
  for (const c of categories) categoryMap.set(c.id, c);

  const centerCatIds = new Set(personCatMap.get(centerPersonId) ?? []);
  const placed = new Set<string>([centerPersonId]);
  const nodes: OrbitNode[] = [];
  const rings: OrbitRing[] = [];
  let ringNum = 1;

  // Ring 1: Explicitly linked
  const linkedIds = new Set(centerPerson.linkedPersonIds ?? []);
  const linked = people.filter((p) => linkedIds.has(p.id)).sort(interactionSort);
  if (linked.length > 0) {
    const radius = SOLAR.BASE_RADIUS;
    rings.push({ ring: ringNum, radius, label: 'Connected', color: '#4A90D9' });
    linked.forEach((p, i) => {
      const pos = positionOnRing(i, linked.length, radius);
      nodes.push(makeNode(p, ringNum, pos, '#4A90D9'));
      placed.add(p.id);
    });
    ringNum++;
  }

  // Ring 2+: People sharing categories with center person
  for (const cat of categories) {
    if (!centerCatIds.has(cat.id)) continue;

    const catPeople = people
      .filter((p) => {
        if (placed.has(p.id)) return false;
        const pCats = personCatMap.get(p.id) ?? [];
        return pCats.includes(cat.id);
      })
      .sort(interactionSort);

    if (catPeople.length === 0) continue;

    const radius = SOLAR.BASE_RADIUS + (ringNum - 1) * SOLAR.RING_SPACING;
    rings.push({ ring: ringNum, radius, label: cat.name, color: cat.color });
    catPeople.forEach((p, i) => {
      const pos = positionOnRing(i, catPeople.length, radius);
      nodes.push(makeNode(p, ringNum, pos, cat.color));
      placed.add(p.id);
    });
    ringNum++;
  }

  // Same company (if not already placed)
  if (centerPerson.company) {
    const companyKey = centerPerson.company.toLowerCase().trim();
    const colleagues = people
      .filter((p) => !placed.has(p.id) && p.company?.toLowerCase().trim() === companyKey)
      .sort(interactionSort);
    if (colleagues.length > 0) {
      const radius = SOLAR.BASE_RADIUS + (ringNum - 1) * SOLAR.RING_SPACING;
      rings.push({ ring: ringNum, radius, label: centerPerson.company, color: '#2ECC71' });
      colleagues.forEach((p, i) => {
        const pos = positionOnRing(i, colleagues.length, radius);
        nodes.push(makeNode(p, ringNum, pos, '#2ECC71'));
        placed.add(p.id);
      });
    }
  }

  const visibleIds = new Set(nodes.map((n) => n.id));
  const connections = computeConnectionLines(visibleIds, people);

  return { center, rings, nodes, connections };
}

export interface CircleEntry {
  display: string;
  isOnPlatform: boolean;
}

export function computeCircleOrbit(
  centerLabel: string,
  circleEntries: CircleEntry[]
): OrbitLayout {
  const center: OrbitNode = {
    id: 'circle-center',
    label: centerLabel,
    ring: 0, angle: 0, x: 0, y: 0,
    isFavorite: false,
    isOnPlatform: true,
    isReadOnly: true,
    daysSinceContact: null,
  };

  const nodes: OrbitNode[] = [];
  const radius = SOLAR.BASE_RADIUS;
  const rings: OrbitRing[] = [{ ring: 1, radius, label: 'Their Circle', color: '#888888' }];

  circleEntries.forEach((entry, i) => {
    const pos = positionOnRing(i, circleEntries.length, radius);
    nodes.push({
      id: `circle-${i}`,
      label: entry.display,
      ring: 1,
      angle: pos.angle,
      x: pos.x,
      y: pos.y,
      isFavorite: false,
      isOnPlatform: entry.isOnPlatform,
      isReadOnly: true,
      daysSinceContact: null,
    });
  });

  return { center, rings, nodes, connections: [] };
}

export function computeOrbitLayout(input: OrbitInput): OrbitLayout {
  if (input.centerPersonId === 'me') {
    return computeMeCenter(input);
  }
  return computeDrillDown(input);
}

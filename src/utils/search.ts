function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  // Exact substring match
  if (t.includes(q)) return true;

  // Fuzzy: allow 1 character difference for queries 3+ chars
  if (q.length >= 3) {
    // Check if removing any single char from query produces a substring match
    for (let i = 0; i < q.length; i++) {
      const partial = q.slice(0, i) + q.slice(i + 1);
      if (t.includes(partial)) return true;
    }
    // Check if any word in text starts with the query (prefix match)
    const words = t.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(q.slice(0, -1))) return true;
    }
  }

  return false;
}

export function fuzzySearchPeople<T extends {
  firstName: string;
  lastName: string;
  nickname?: string;
  company?: string;
  occupation?: string;
  relationshipLabel?: string;
  howWeMet?: string;
  phones?: { value: string }[];
  emails?: { value: string }[];
}>(people: T[], query: string): T[] {
  const q = query.trim();
  if (!q) return people;

  return people.filter((p) => {
    const fields = [
      p.firstName,
      p.lastName,
      `${p.firstName} ${p.lastName}`,
      p.nickname,
      p.company,
      p.occupation,
      p.relationshipLabel,
      p.howWeMet,
      ...(p.phones?.map((ph) => ph.value) ?? []),
      ...(p.emails?.map((e) => e.value) ?? []),
    ].filter(Boolean) as string[];

    return fields.some((field) => fuzzyMatch(field, q));
  });
}

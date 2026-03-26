import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const bday = new Date(birthday + 'T00:00:00');
  const nextBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const diff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const diff = today.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function useReminders(nudgeDays: number = 30) {
  const allPeople = useLiveQuery(() => db.people.toArray(), [], []);

  const upcomingBirthdays = useMemo(() => {
    const withBirthdays = allPeople.filter((p) => !!p.birthday);
    return withBirthdays
      .map((p) => ({
        person: p,
        daysUntil: getDaysUntilBirthday(p.birthday!),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [allPeople]);

  const nudges = useMemo(() => {
    return allPeople
      .filter((p) => {
        if (!p.lastInteractionDate) return true;
        return daysSince(p.lastInteractionDate) >= nudgeDays;
      })
      .map((p) => ({
        person: p,
        daysSinceContact: p.lastInteractionDate
          ? daysSince(p.lastInteractionDate)
          : null,
      }))
      .sort((a, b) => {
        if (a.daysSinceContact === null) return -1;
        if (b.daysSinceContact === null) return 1;
        return b.daysSinceContact - a.daysSinceContact;
      });
  }, [allPeople, nudgeDays]);

  return { upcomingBirthdays, nudges };
}

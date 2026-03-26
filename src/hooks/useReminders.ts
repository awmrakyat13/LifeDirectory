import { useMemo } from 'react';
import { usePeople } from './usePeople';
import { getDaysUntilDate, daysSince } from '../utils/date';

interface DateReminder {
  person: { id: string; firstName: string; lastName: string; photoBlob?: Blob };
  label: string;
  dateStr: string;
  daysUntil: number;
}

export function useReminders(nudgeDays: number = 30) {
  const allPeople = usePeople();

  const upcomingDates = useMemo(() => {
    const reminders: DateReminder[] = [];

    for (const p of allPeople) {
      const personRef = { id: p.id, firstName: p.firstName, lastName: p.lastName, photoBlob: p.photoBlob };

      if (p.birthday) {
        reminders.push({
          person: personRef,
          label: 'Birthday',
          dateStr: p.birthday,
          daysUntil: getDaysUntilDate(p.birthday),
        });
      }
      if (p.anniversary) {
        reminders.push({
          person: personRef,
          label: 'Anniversary',
          dateStr: p.anniversary,
          daysUntil: getDaysUntilDate(p.anniversary),
        });
      }
      if (p.customDates) {
        for (const cd of p.customDates) {
          if (cd.date) {
            reminders.push({
              person: personRef,
              label: cd.label || 'Custom date',
              dateStr: cd.date,
              daysUntil: getDaysUntilDate(cd.date),
            });
          }
        }
      }
    }

    return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
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

  return { upcomingDates, nudges };
}

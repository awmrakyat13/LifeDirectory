export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthDay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysUntilDate(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  const next = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  if (next < today) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntilLabel(days: number): string {
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}

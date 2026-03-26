export const NAV_ITEMS = [
  { to: '/', icon: '\u2302', label: 'Home' },
  { to: '/people', icon: '\u{1F465}', label: 'People' },
  { to: '/categories', icon: '\u2630', label: 'Categories' },
  { to: '/reminders', icon: '\u{1F514}', label: 'Reminders' },
  { to: '/settings', icon: '\u2699', label: 'Settings' },
] as const;

export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter(
  (item) => item.to !== '/categories'
);

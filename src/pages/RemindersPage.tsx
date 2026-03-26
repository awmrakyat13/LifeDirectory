import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useReminders } from '../hooks/useReminders';
import { Avatar } from '../components/ui/Avatar';
import { daysUntilLabel, formatMonthDay } from '../utils/date';
import styles from './RemindersPage.module.css';

export function RemindersPage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'));
  const nudgeDays = settings?.nudgeDays ?? 30;
  const { upcomingDates, nudges } = useReminders(nudgeDays);

  return (
    <div className={styles.container}>
      <h1>Reminders</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Dates</h2>
        {upcomingDates.length === 0 ? (
          <p className={styles.empty}>No dates recorded yet.</p>
        ) : (
          <div className={styles.list}>
            {upcomingDates.slice(0, 20).map((item, i) => (
              <Link key={`${item.person.id}-${item.label}-${i}`} to={`/people/${item.person.id}`} className={styles.item}>
                <Avatar firstName={item.person.firstName} lastName={item.person.lastName} photoBlob={item.person.photoBlob} size={36} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.person.firstName} {item.person.lastName}</span>
                  <span className={styles.itemMeta}>
                    {item.label} &middot; {formatMonthDay(item.dateStr)}
                  </span>
                </div>
                <span className={`${styles.badge} ${item.daysUntil <= 7 ? styles.badgeUrgent : ''}`}>
                  {daysUntilLabel(item.daysUntil)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Haven't Talked To ({nudgeDays}+ days)</h2>
        {nudges.length === 0 ? (
          <p className={styles.empty}>You're all caught up!</p>
        ) : (
          <div className={styles.list}>
            {nudges.map(({ person, daysSinceContact }) => (
              <Link key={person.id} to={`/people/${person.id}`} className={styles.item}>
                <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={36} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{person.firstName} {person.lastName}</span>
                </div>
                <span className={styles.badge}>
                  {daysSinceContact === null ? 'Never' : `${daysSinceContact}d ago`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

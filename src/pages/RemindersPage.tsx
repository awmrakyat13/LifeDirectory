import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useReminders } from '../hooks/useReminders';
import { Avatar } from '../components/ui/Avatar';
import styles from './RemindersPage.module.css';

export function RemindersPage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'));
  const nudgeDays = settings?.nudgeDays ?? 30;
  const { upcomingBirthdays, nudges } = useReminders(nudgeDays);

  return (
    <div className={styles.container}>
      <h1>Reminders</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Birthdays</h2>
        {upcomingBirthdays.length === 0 ? (
          <p className={styles.empty}>No birthdays recorded yet.</p>
        ) : (
          <div className={styles.list}>
            {upcomingBirthdays.slice(0, 15).map(({ person, daysUntil }) => (
              <Link key={person.id} to={`/people/${person.id}`} className={styles.item}>
                <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={36} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{person.firstName} {person.lastName}</span>
                  <span className={styles.itemMeta}>
                    {new Date(person.birthday + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className={`${styles.badge} ${daysUntil <= 7 ? styles.badgeUrgent : ''}`}>
                  {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
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

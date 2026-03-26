import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useReminders } from '../hooks/useReminders';
import { Avatar } from '../components/ui/Avatar';
import styles from './HomePage.module.css';

export function HomePage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'));
  const totalPeople = useLiveQuery(() => db.people.count(), [], 0);
  const totalCategories = useLiveQuery(() => db.categories.count(), [], 0);
  const favorites = useLiveQuery(
    () => db.people.where('isFavorite').equals(1).toArray(),
    [],
    []
  );
  const recentPeople = useLiveQuery(
    () => db.people.orderBy('updatedAt').reverse().limit(5).toArray(),
    [],
    []
  );

  const nudgeDays = settings?.nudgeDays ?? 30;
  const { upcomingBirthdays, nudges } = useReminders(nudgeDays);
  const soonBirthdays = upcomingBirthdays.filter((b) => b.daysUntil <= 30).slice(0, 5);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Life Directory</h1>

      <div className={styles.stats}>
        <Link to="/people" className={styles.statCard}>
          <div className={styles.statNumber}>{totalPeople}</div>
          <div className={styles.statLabel}>People</div>
        </Link>
        <Link to="/categories" className={styles.statCard}>
          <div className={styles.statNumber}>{totalCategories}</div>
          <div className={styles.statLabel}>Categories</div>
        </Link>
        <Link to="/reminders" className={styles.statCard}>
          <div className={styles.statNumber}>{nudges.length}</div>
          <div className={styles.statLabel}>Need Attention</div>
        </Link>
      </div>

      {soonBirthdays.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Birthdays</h2>
            <Link to="/reminders" className={styles.seeAll}>See all</Link>
          </div>
          <div className={styles.list}>
            {soonBirthdays.map(({ person, daysUntil }) => (
              <Link key={person.id} to={`/people/${person.id}`} className={styles.listItem}>
                <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={32} />
                <span className={styles.listName}>{person.firstName} {person.lastName}</span>
                <span className={styles.listMeta}>
                  {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil}d`}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Favorites</h2>
          <div className={styles.list}>
            {favorites.map((person) => (
              <Link key={person.id} to={`/people/${person.id}`} className={styles.listItem}>
                <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={32} />
                <span className={styles.listName}>{person.firstName} {person.lastName}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentPeople.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently Updated</h2>
            <Link to="/people" className={styles.seeAll}>View all</Link>
          </div>
          <div className={styles.list}>
            {recentPeople.map((person) => (
              <Link key={person.id} to={`/people/${person.id}`} className={styles.listItem}>
                <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={32} />
                <span className={styles.listName}>{person.firstName} {person.lastName}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {totalPeople === 0 && (
        <div className={styles.welcome}>
          <h2>Welcome to Life Directory</h2>
          <p>Your personal directory for remembering the people who matter.</p>
          <Link to="/people/new" className={styles.getStartedBtn}>+ Add Your First Person</Link>
        </div>
      )}
    </div>
  );
}

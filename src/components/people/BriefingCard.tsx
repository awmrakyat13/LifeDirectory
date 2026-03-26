import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { usePeople } from '../../hooks/usePeople';
import { useInteractions } from '../../hooks/useInteractions';
import { getDaysUntilDate, daysSince, formatDate } from '../../utils/date';
import type { Person } from '../../models/types';
import styles from './BriefingCard.module.css';

interface BriefingCardProps {
  person: Person;
}

export function BriefingCard({ person }: BriefingCardProps) {
  const allPeople = usePeople();
  const { interactions } = useInteractions(person.id);
  const lastInteraction = interactions[0];

  const birthdayDays = person.birthday ? getDaysUntilDate(person.birthday) : null;
  const anniversaryDays = person.anniversary ? getDaysUntilDate(person.anniversary) : null;
  const daysSinceContact = person.lastInteractionDate ? daysSince(person.lastInteractionDate) : null;

  const connector = person.knownThrough
    ? allPeople.find((p) => p.id === person.knownThrough!.personId)
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar firstName={person.firstName} lastName={person.lastName} photoBlob={person.photoBlob} size={48} />
        <div className={styles.headerInfo}>
          <div className={styles.name}>{person.firstName} {person.lastName}</div>
          {person.relationshipLabel && <div className={styles.relationship}>{person.relationshipLabel}</div>}
          {connector && (
            <div className={styles.knownThrough}>
              Known through <Link to={`/people/${connector.id}`} style={{ color: 'var(--color-accent)' }}>{connector.firstName}</Link>
              {person.knownThrough!.context && ` (${person.knownThrough!.context})`}
            </div>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Last Contact */}
        <div className={styles.item}>
          <div className={styles.itemLabel}>Last Contact</div>
          <div className={styles.itemValue}>
            {daysSinceContact !== null ? (
              <span className={daysSinceContact > 60 ? styles.danger : daysSinceContact > 30 ? styles.warn : ''}>
                {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
              </span>
            ) : (
              <span className={styles.danger}>Never</span>
            )}
          </div>
        </div>

        {/* Birthday */}
        {birthdayDays !== null && (
          <div className={styles.item}>
            <div className={styles.itemLabel}>Birthday</div>
            <div className={styles.itemValue}>
              <span className={birthdayDays <= 7 ? styles.warn : ''}>
                {birthdayDays === 0 ? 'TODAY!' : birthdayDays === 1 ? 'Tomorrow!' : `In ${birthdayDays} days`}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{formatDate(person.birthday)}</div>
            </div>
          </div>
        )}

        {/* Anniversary */}
        {anniversaryDays !== null && (
          <div className={styles.item}>
            <div className={styles.itemLabel}>Anniversary</div>
            <div className={styles.itemValue}>
              <span className={anniversaryDays <= 7 ? styles.warn : ''}>
                {anniversaryDays === 0 ? 'TODAY!' : `In ${anniversaryDays} days`}
              </span>
            </div>
          </div>
        )}

        {/* Last talked about */}
        {lastInteraction && (
          <div className={styles.item}>
            <div className={styles.itemLabel}>Last Talked About</div>
            <div className={styles.itemValue}>
              {lastInteraction.summary || lastInteraction.type}
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{formatDate(lastInteraction.date)}</div>
            </div>
          </div>
        )}

        {/* Topics to bring up */}
        {person.topicsToBringUp && person.topicsToBringUp.length > 0 && (
          <div className={`${styles.item} ${styles.section}`}>
            <div className={styles.itemLabel}>Bring Up</div>
            <div className={styles.tags}>
              {person.topicsToBringUp.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
            </div>
          </div>
        )}

        {/* Sensitive topics */}
        {person.sensitiveTopics && person.sensitiveTopics.length > 0 && (
          <div className={`${styles.item} ${styles.section}`}>
            <div className={styles.itemLabel}>Avoid / Be Careful</div>
            <div className={styles.tags}>
              {person.sensitiveTopics.map((t, i) => <span key={i} className={`${styles.tag} ${styles.sensitiveTag}`}>{t}</span>)}
            </div>
          </div>
        )}

        {/* Life updates */}
        {person.lifeUpdates && (
          <div className={`${styles.item} ${styles.section}`}>
            <div className={styles.itemLabel}>Life Updates</div>
            <div className={styles.sectionText}>{person.lifeUpdates}</div>
          </div>
        )}

        {/* Occupation */}
        {(person.occupation || person.company) && (
          <div className={styles.item}>
            <div className={styles.itemLabel}>Work</div>
            <div className={styles.itemValue}>
              {person.occupation}{person.company ? ` at ${person.company}` : ''}
            </div>
          </div>
        )}

        {/* Interests */}
        {person.interests && person.interests.length > 0 && (
          <div className={styles.item}>
            <div className={styles.itemLabel}>Interests</div>
            <div className={styles.tags}>
              {person.interests.slice(0, 5).map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

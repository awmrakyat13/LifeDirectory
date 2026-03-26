import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePeople } from '../../hooks/usePeople';
import { useInteractions } from '../../hooks/useInteractions';
import { Avatar } from '../ui/Avatar';
import { CategoryPill } from '../categories/CategoryPill';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { usePersonActions } from '../../hooks/usePeople';
import { formatDate } from '../../utils/date';
import type { Person, Category } from '../../models/types';
import styles from './PersonDetail.module.css';

interface PersonDetailProps {
  person: Person;
  categories: Category[];
}

export function PersonDetail({ person, categories }: PersonDetailProps) {
  const navigate = useNavigate();
  const { deletePerson, toggleFavorite } = usePersonActions();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch linked people from Firestore
  const allPeople = usePeople();
  const linkedPeople = (person.linkedPersonIds && person.linkedPersonIds.length > 0)
    ? allPeople.filter((p) => person.linkedPersonIds!.includes(p.id))
    : [];

  // Interaction stats
  const { interactions: allInteractions } = useInteractions(person.id);
  const interactionStats = (() => {
    if (allInteractions.length === 0) return null;
    const sorted = [...allInteractions].sort((a, b) => a.date.localeCompare(b.date));
    const totalCount = allInteractions.length;
    const firstDate = sorted[0].date;
    const lastDate = sorted[sorted.length - 1].date;
    const daySpan = Math.max(1, Math.floor((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)));
    const avgDaysBetween = totalCount > 1 ? Math.round(daySpan / (totalCount - 1)) : null;
    const typeCounts: Record<string, number> = {};
    for (const i of allInteractions) {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return { totalCount, avgDaysBetween, mostCommonType };
  })();

  async function handleDelete() {
    const name = `${person.firstName} ${person.lastName}`;
    await deletePerson(person.id);
    toast(`${name} deleted`, 'info');
    navigate('/people');
  }

  async function handleToggleFavorite() {
    await toggleFavorite(person.id);
    toast(person.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  }

  const hasDates = person.birthday || person.anniversary || (person.customDates && person.customDates.length > 0);
  const hasFamily = person.spousePartner || (person.children && person.children.length > 0) || (person.pets && person.pets.length > 0);
  const hasWork = person.occupation || person.company || (person.interests && person.interests.length > 0) || (person.dietaryRestrictions && person.dietaryRestrictions.length > 0) || (person.languages && person.languages.length > 0);
  const hasContact = (person.phones && person.phones.length > 0) || (person.emails && person.emails.length > 0) || (person.socialMedia && person.socialMedia.length > 0) || person.address;
  const hasMemory = person.lifeUpdates || (person.topicsToBringUp && person.topicsToBringUp.length > 0) || (person.giftIdeas && person.giftIdeas.length > 0) || (person.sensitiveTopics && person.sensitiveTopics.length > 0) || person.notes;

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/people" className={styles.backBtn}>&larr; Back</Link>
      </div>

      <div className={styles.header}>
        <Avatar photoBlob={person.photoBlob} firstName={person.firstName} lastName={person.lastName} size={80} />
        <div className={styles.headerInfo}>
          <div className={styles.name}>
            {person.firstName} {person.lastName}
            {person.nickname && <span className={styles.nickname}> ({person.nickname})</span>}
          </div>
          {person.relationshipLabel && <div className={styles.relationship}>{person.relationshipLabel}</div>}
          {categories.length > 0 && (
            <div className={styles.categories}>
              {categories.map((cat) => (
                <CategoryPill key={cat.id} name={cat.name} color={cat.color} />
              ))}
            </div>
          )}
        </div>
        <button
          className={`${styles.favBtn} ${person.isFavorite ? styles.favActive : ''}`}
          onClick={handleToggleFavorite}
          aria-label={person.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {person.isFavorite ? '\u2605' : '\u2606'}
        </button>
      </div>

      <div className={styles.headerActions}>
        <Link to={`/people/${person.id}/edit`} className={styles.editBtn}>Edit</Link>
        <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>Delete</button>
      </div>

      {person.howWeMet && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>How We Met</div>
            <div className={styles.howWeMet}>{person.howWeMet}</div>
          </div>
        </div>
      )}

      {hasDates && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Dates</h3>
          {person.birthday && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Birthday</div>
              <div className={styles.fieldValue}>{formatDate(person.birthday)}</div>
            </div>
          )}
          {person.anniversary && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Anniversary</div>
              <div className={styles.fieldValue}>{formatDate(person.anniversary)}</div>
            </div>
          )}
          {person.customDates?.map((d, i) => (
            <div key={i} className={styles.field}>
              <div className={styles.fieldLabel}>{d.label}</div>
              <div className={styles.fieldValue}>{formatDate(d.date)}</div>
            </div>
          ))}
        </div>
      )}

      {hasFamily && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Family & Connections</h3>
          {person.spousePartner && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Spouse / Partner</div>
              <div className={styles.fieldValue}>{person.spousePartner}</div>
            </div>
          )}
          {person.children && person.children.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Children</div>
              {person.children.map((c, i) => (
                <div key={i} className={styles.childItem}>
                  {c.name}{c.birthYear ? ` (born ${c.birthYear})` : ''}
                </div>
              ))}
            </div>
          )}
          {person.pets && person.pets.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Pets</div>
              {person.pets.map((p, i) => (
                <div key={i} className={styles.petItem}>
                  {p.name}{p.type ? ` (${p.type})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {linkedPeople.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Linked People</h3>
          <div className={styles.linkedPeople}>
            {linkedPeople.map((lp) => (
              <Link key={lp.id} to={`/people/${lp.id}`} className={styles.linkedPerson}>
                <Avatar firstName={lp.firstName} lastName={lp.lastName} photoBlob={lp.photoBlob} size={32} />
                <span>{lp.firstName} {lp.lastName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasWork && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Work & Life</h3>
          {(person.occupation || person.company) && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Occupation</div>
              <div className={styles.fieldValue}>
                {person.occupation}{person.company ? ` at ${person.company}` : ''}
              </div>
            </div>
          )}
          {person.interests && person.interests.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Interests</div>
              <div className={styles.tags}>
                {person.interests.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
          {person.dietaryRestrictions && person.dietaryRestrictions.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Dietary Restrictions</div>
              <div className={styles.tags}>
                {person.dietaryRestrictions.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
          {person.languages && person.languages.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Languages</div>
              <div className={styles.tags}>
                {person.languages.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {hasContact && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Contact</h3>
          {person.phones?.map((p, i) => (
            <div key={i} className={styles.field}>
              <div className={styles.fieldLabel}>{p.label}</div>
              <div className={styles.fieldValue}>{p.value}</div>
            </div>
          ))}
          {person.emails?.map((e, i) => (
            <div key={i} className={styles.field}>
              <div className={styles.fieldLabel}>{e.label}</div>
              <div className={styles.fieldValue}>{e.value}</div>
            </div>
          ))}
          {person.socialMedia?.map((s, i) => (
            <div key={i} className={styles.field}>
              <div className={styles.fieldLabel}>{s.platform}</div>
              <div className={styles.fieldValue}>{s.handle}</div>
            </div>
          ))}
          {person.address && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Address</div>
              <div className={styles.fieldValue} style={{ whiteSpace: 'pre-line' }}>{person.address}</div>
            </div>
          )}
        </div>
      )}

      {hasMemory && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Conversation Memory</h3>
          {person.lifeUpdates && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Life Updates</div>
              <div className={styles.fieldValue} style={{ whiteSpace: 'pre-line' }}>{person.lifeUpdates}</div>
            </div>
          )}
          {person.topicsToBringUp && person.topicsToBringUp.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Topics to Bring Up</div>
              <div className={styles.tags}>
                {person.topicsToBringUp.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
          {person.giftIdeas && person.giftIdeas.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Gift Ideas</div>
              <div className={styles.tags}>
                {person.giftIdeas.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
          {person.sensitiveTopics && person.sensitiveTopics.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Sensitive Topics</div>
              <div className={styles.tags}>
                {person.sensitiveTopics.map((t, i) => <span key={i} className={`${styles.tag} ${styles.sensitiveTag}`}>{t}</span>)}
              </div>
            </div>
          )}
          {person.notes && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Notes</div>
              <div className={styles.fieldValue} style={{ whiteSpace: 'pre-line' }}>{person.notes}</div>
            </div>
          )}
        </div>
      )}

      {interactionStats && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Interaction Stats</h3>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{interactionStats.totalCount}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            {interactionStats.avgDaysBetween !== null && (
              <div className={styles.stat}>
                <div className={styles.statValue}>{interactionStats.avgDaysBetween}d</div>
                <div className={styles.statLabel}>Avg. gap</div>
              </div>
            )}
            {interactionStats.mostCommonType && (
              <div className={styles.stat}>
                <div className={styles.statValue}>{interactionStats.mostCommonType}</div>
                <div className={styles.statLabel}>Most common</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Person"
          message={`Are you sure you want to delete ${person.firstName} ${person.lastName}? This will also remove all their interaction history.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

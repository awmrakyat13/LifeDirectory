import { TagsInput } from '../../ui/TagsInput';
import styles from '../PersonForm.module.css';

interface MemorySectionProps {
  lifeUpdates: string;
  setLifeUpdates: (val: string) => void;
  topicsToBringUp: string[];
  setTopicsToBringUp: (val: string[]) => void;
  giftIdeas: string[];
  setGiftIdeas: (val: string[]) => void;
  sensitiveTopics: string[];
  setSensitiveTopics: (val: string[]) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export function MemorySection({
  lifeUpdates,
  setLifeUpdates,
  topicsToBringUp,
  setTopicsToBringUp,
  giftIdeas,
  setGiftIdeas,
  sensitiveTopics,
  setSensitiveTopics,
  notes,
  setNotes,
}: MemorySectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Conversation Memory</h2>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label className={styles.label}>Life Updates</label>
          <textarea className={styles.textarea} value={lifeUpdates} onChange={(e) => setLifeUpdates(e.target.value)} placeholder="Recent life events, changes, news..." />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Topics to Bring Up Next Time</label>
          <TagsInput value={topicsToBringUp} onChange={setTopicsToBringUp} placeholder="Type and press Enter" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Gift Ideas</label>
          <TagsInput value={giftIdeas} onChange={setGiftIdeas} placeholder="Type and press Enter" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sensitive Topics</label>
          <TagsInput value={sensitiveTopics} onChange={setSensitiveTopics} placeholder="Things to be careful about" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>General Notes</label>
          <textarea className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else worth remembering..." />
        </div>
      </div>
    </div>
  );
}

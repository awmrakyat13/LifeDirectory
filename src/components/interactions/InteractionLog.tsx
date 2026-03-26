import { useState } from 'react';
import { useInteractions } from '../../hooks/useInteractions';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { formatDateShort } from '../../utils/date';
import styles from './InteractionLog.module.css';

const INTERACTION_TYPES = [
  'In person',
  'Phone call',
  'Video call',
  'Text',
  'Social media',
  'Email',
  'Other',
];

interface InteractionLogProps {
  personId: string;
}

export function InteractionLog({ personId }: InteractionLogProps) {
  const { interactions, addInteraction, deleteInteraction } = useInteractions(personId);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState(INTERACTION_TYPES[0]);
  const [summary, setSummary] = useState('');

  async function handleSave() {
    await addInteraction({ date, type, summary });
    toast('Interaction logged', 'success');
    setShowForm(false);
    setSummary('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(INTERACTION_TYPES[0]);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Interaction Log</h3>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + Log Interaction
        </button>
      </div>

      {interactions.length === 0 ? (
        <p className={styles.empty}>No interactions logged yet.</p>
      ) : (
        <div className={styles.list}>
          {interactions.map((interaction) => (
            <div key={interaction.id} className={styles.item}>
              <div className={styles.itemDate}>{formatDateShort(interaction.date)}</div>
              <div className={styles.itemBody}>
                <div className={styles.itemType}>{interaction.type}</div>
                {interaction.summary && (
                  <div className={styles.itemSummary}>{interaction.summary}</div>
                )}
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteInteraction(interaction.id)}
                aria-label="Delete interaction"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Log Interaction" onClose={() => setShowForm(false)}>
          <div className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Date</label>
                <input
                  className={styles.formInput}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Type</label>
                <select
                  className={styles.formSelect}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {INTERACTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Summary (optional)</label>
              <textarea
                className={styles.formTextarea}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What did you talk about?"
              />
            </div>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

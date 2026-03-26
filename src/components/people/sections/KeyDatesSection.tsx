import type { NamedDate } from '../../../models/types';
import styles from '../PersonForm.module.css';

interface KeyDatesSectionProps {
  birthday: string;
  setBirthday: (val: string) => void;
  anniversary: string;
  setAnniversary: (val: string) => void;
  customDates: NamedDate[];
  setCustomDates: (val: NamedDate[]) => void;
}

export function KeyDatesSection({
  birthday,
  setBirthday,
  anniversary,
  setAnniversary,
  customDates,
  setCustomDates,
}: KeyDatesSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Key Dates</h2>
      <div className={styles.fieldGroup}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Birthday</label>
            <input className={styles.input} type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Anniversary</label>
            <input className={styles.input} type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
          </div>
        </div>

        <div className={styles.arrayField}>
          <label className={styles.label}>Other Important Dates</label>
          {customDates.map((d, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Label" value={d.label} onChange={(e) => {
                const next = [...customDates];
                next[i] = { ...d, label: e.target.value };
                setCustomDates(next);
              }} />
              <input className={styles.input} type="date" value={d.date} onChange={(e) => {
                const next = [...customDates];
                next[i] = { ...d, date: e.target.value };
                setCustomDates(next);
              }} />
              <button type="button" className={styles.removeBtn} onClick={() => setCustomDates(customDates.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setCustomDates([...customDates, { label: '', date: '' }])}>+ Add Date</button>
        </div>
      </div>
    </div>
  );
}

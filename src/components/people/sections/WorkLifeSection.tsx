import { TagsInput } from '../../ui/TagsInput';
import styles from '../PersonForm.module.css';

interface WorkLifeSectionProps {
  occupation: string;
  setOccupation: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  interests: string[];
  setInterests: (val: string[]) => void;
  dietaryRestrictions: string[];
  setDietaryRestrictions: (val: string[]) => void;
  languages: string[];
  setLanguages: (val: string[]) => void;
}

export function WorkLifeSection({
  occupation,
  setOccupation,
  company,
  setCompany,
  interests,
  setInterests,
  dietaryRestrictions,
  setDietaryRestrictions,
  languages,
  setLanguages,
}: WorkLifeSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Work & Life</h2>
      <div className={styles.fieldGroup}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Occupation</label>
            <input className={styles.input} value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Company</label>
            <input className={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Interests & Hobbies</label>
          <TagsInput value={interests} onChange={setInterests} placeholder="Type and press Enter" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Dietary Restrictions / Allergies</label>
          <TagsInput value={dietaryRestrictions} onChange={setDietaryRestrictions} placeholder="Type and press Enter" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Languages</label>
          <TagsInput value={languages} onChange={setLanguages} placeholder="Type and press Enter" />
        </div>
      </div>
    </div>
  );
}

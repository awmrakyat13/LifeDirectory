import type { Child, Pet } from '../../../models/types';
import styles from '../PersonForm.module.css';

interface FamilySectionProps {
  spousePartner: string;
  setSpousePartner: (val: string) => void;
  children: Child[];
  setChildren: (val: Child[]) => void;
  pets: Pet[];
  setPets: (val: Pet[]) => void;
}

export function FamilySection({
  spousePartner,
  setSpousePartner,
  children,
  setChildren,
  pets,
  setPets,
}: FamilySectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Family & Connections</h2>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label className={styles.label}>Spouse / Partner</label>
          <input className={styles.input} value={spousePartner} onChange={(e) => setSpousePartner(e.target.value)} />
        </div>

        <div className={styles.arrayField}>
          <label className={styles.label}>Children</label>
          {children.map((c, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Name" value={c.name} onChange={(e) => {
                const next = [...children];
                next[i] = { ...c, name: e.target.value };
                setChildren(next);
              }} />
              <input className={styles.input} type="number" placeholder="Birth Year" value={c.birthYear ?? ''} onChange={(e) => {
                const next = [...children];
                next[i] = { ...c, birthYear: e.target.value ? parseInt(e.target.value) : undefined };
                setChildren(next);
              }} style={{ maxWidth: 120 }} />
              <button type="button" className={styles.removeBtn} onClick={() => setChildren(children.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setChildren([...children, { name: '' }])}>+ Add Child</button>
        </div>

        <div className={styles.arrayField}>
          <label className={styles.label}>Pets</label>
          {pets.map((p, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Name" value={p.name} onChange={(e) => {
                const next = [...pets];
                next[i] = { ...p, name: e.target.value };
                setPets(next);
              }} />
              <input className={styles.input} placeholder="Type (Dog, Cat...)" value={p.type ?? ''} onChange={(e) => {
                const next = [...pets];
                next[i] = { ...p, type: e.target.value || undefined };
                setPets(next);
              }} />
              <button type="button" className={styles.removeBtn} onClick={() => setPets(pets.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setPets([...pets, { name: '' }])}>+ Add Pet</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { usePersonActions } from '../../hooks/usePeople';
import { useToast } from './Toast';
import styles from './QuickAdd.module.css';

export function QuickAddFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Quick add person">
        +
      </button>
      {open && <QuickAddSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickAddSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { addPerson } = usePersonActions();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  function toggleCat(id: string) {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!firstName.trim()) return;
    const id = await addPerson(
      { firstName: firstName.trim(), lastName: lastName.trim() || '', isFavorite: false },
      selectedCats
    );
    toast(`${firstName} added`, 'success');
    onClose();
    if (id) navigate(`/people/${id}/edit`);
  }

  function handleFullForm() {
    onClose();
    navigate('/people/new');
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetTitle}>
          Quick Add
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name *</label>
              <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus placeholder="First name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>

          {categories.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <div className={styles.categoryRow}>
                {categories.map((cat) => {
                  const selected = selectedCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.catBtn} ${selected ? styles.catBtnSelected : ''}`}
                      style={{
                        borderColor: cat.color,
                        background: selected ? cat.color : 'transparent',
                        color: selected ? 'white' : cat.color,
                      }}
                      onClick={() => toggleCat(cat.id)}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.detailLink} onClick={handleFullForm}>
              Full Form
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={!firstName.trim()}>
              Add & Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import styles from './CategoryManager.module.css';

const PRESET_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4',
  '#8BC34A', '#FF5722',
];

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function openAddForm() {
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setShowForm(true);
  }

  function openEditForm(id: string, currentName: string, currentColor: string) {
    setEditingId(id);
    setName(currentName);
    setColor(currentColor);
    setShowForm(true);
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editingId) {
      await updateCategory(editingId, { name: trimmed, color });
    } else {
      await addCategory(trimmed, color);
    }
    setShowForm(false);
  }

  async function handleDelete() {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Categories</h1>
        <button className={styles.addBtn} onClick={openAddForm}>
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <p className={styles.empty}>No categories yet. Add one to get started.</p>
      ) : (
        <div className={styles.list}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.item}>
              <span className={styles.dragHandle}>::</span>
              <span className={styles.colorDot} style={{ background: cat.color }} />
              <span className={styles.name}>{cat.name}</span>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditForm(cat.id, cat.name, cat.color)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editingId ? 'Edit Category' : 'New Category'}
          onClose={() => setShowForm(false)}
        >
          <div className={styles.form}>
            <div>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Family, Work, Friends..."
                autoFocus
              />
            </div>
            <div>
              <label className={styles.label}>Color</label>
              <div className={styles.colorPicker}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorOption} ${c === color ? styles.colorOptionSelected : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.cancelFormBtn} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {editingId ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"? People in this category won't be deleted, but they'll be removed from this category.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

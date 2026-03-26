import type { Category } from '../../../models/types';
import styles from '../PersonForm.module.css';

interface CategoriesSectionProps {
  categories: Category[];
  selectedCategoryIds: string[];
  toggleCategory: (id: string) => void;
}

export function CategoriesSection({
  categories,
  selectedCategoryIds,
  toggleCategory,
}: CategoriesSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Categories</h2>
      <div className={styles.categoryCheckboxes}>
        {categories.map((cat) => {
          const selected = selectedCategoryIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryCheckbox} ${selected ? styles.categoryCheckboxSelected : ''}`}
              style={{
                borderColor: cat.color,
                background: selected ? cat.color : 'transparent',
                color: selected ? 'white' : cat.color,
              }}
              onClick={() => toggleCategory(cat.id)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

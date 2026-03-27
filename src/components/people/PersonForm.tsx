import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { usePersonActions } from '../../hooks/usePeople';
import { useToast } from '../ui/Toast';
import { compressImage } from '../../utils/image';
import type { Person, Child, Pet, NamedDate } from '../../models/types';
import styles from './PersonForm.module.css';

import { CategoriesSection } from './sections/CategoriesSection';
import { KeyDatesSection } from './sections/KeyDatesSection';
import { FamilySection } from './sections/FamilySection';

interface PersonFormProps {
  initialData?: Person;
  initialCategoryIds?: string[];
}

export function PersonForm({ initialData, initialCategoryIds }: PersonFormProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { addPerson, updatePerson } = usePersonActions();
  const { toast } = useToast();
  const isEditing = !!initialData;

  const [firstName, setFirstName] = useState(initialData?.firstName ?? '');
  const [lastName, setLastName] = useState(initialData?.lastName ?? '');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(initialData?.photoBlob);

  const [birthday, setBirthday] = useState(initialData?.birthday ?? '');
  const [anniversary, setAnniversary] = useState(initialData?.anniversary ?? '');
  const [customDates, setCustomDates] = useState<NamedDate[]>(initialData?.customDates ?? []);

  const [spousePartner, setSpousePartner] = useState(initialData?.spousePartner ?? '');
  const [children, setChildren] = useState<Child[]>(initialData?.children ?? []);
  const [pets, setPets] = useState<Pet[]>(initialData?.pets ?? []);

  const [occupation, setOccupation] = useState(initialData?.occupation ?? '');
  const [company, setCompany] = useState(initialData?.company ?? '');

  const [lifeUpdates, setLifeUpdates] = useState(initialData?.lifeUpdates ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds ?? []);
  const [isFavorite] = useState(initialData?.isFavorite ?? false);

  const fileInputRef = useState<HTMLInputElement | null>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPhotoBlob(compressed);
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const personData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      photoBlob,
      birthday: birthday || undefined,
      anniversary: anniversary || undefined,
      customDates: customDates.length > 0 ? customDates : undefined,
      spousePartner: spousePartner || undefined,
      children: children.length > 0 ? children : undefined,
      pets: pets.length > 0 ? pets : undefined,
      occupation: occupation || undefined,
      company: company || undefined,
      phones: initialData?.phones,
      emails: initialData?.emails,
      socialMedia: initialData?.socialMedia,
      address: initialData?.address,
      lastInteractionDate: initialData?.lastInteractionDate,
      lifeUpdates: lifeUpdates || undefined,
      notes: notes || undefined,
      isFavorite,
      // Preserve fields not shown in form
      nickname: initialData?.nickname,
      relationshipLabel: initialData?.relationshipLabel,
      howWeMet: initialData?.howWeMet,
      linkedPersonIds: initialData?.linkedPersonIds,
      knownThrough: initialData?.knownThrough,
      interests: initialData?.interests,
      dietaryRestrictions: initialData?.dietaryRestrictions,
      languages: initialData?.languages,
      topicsToBringUp: initialData?.topicsToBringUp,
      giftIdeas: initialData?.giftIdeas,
      sensitiveTopics: initialData?.sensitiveTopics,
    };

    if (isEditing) {
      await updatePerson(initialData.id, personData, selectedCategoryIds);
      toast(`${firstName} ${lastName} updated`, 'success');
      navigate(`/people/${initialData.id}`);
    } else {
      const id = await addPerson(personData, selectedCategoryIds);
      toast(`${firstName} ${lastName} added`, 'success');
      navigate(`/people/${id}`);
    }
  }

  const photoUrl = photoBlob ? URL.createObjectURL(photoBlob) : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Person' : 'Add Person'}</h1>
      </div>

      {/* Identity — simplified */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Identity</h2>
        <div className={styles.fieldGroup}>
          <div className={styles.photoSection}>
            {photoUrl ? (
              <img className={styles.photoPreview} src={photoUrl} alt="Photo" onClick={() => (fileInputRef[0] as HTMLInputElement | null)?.click()} />
            ) : (
              <div className={styles.photoPlaceholder} onClick={() => (fileInputRef[0] as HTMLInputElement | null)?.click()}>+</div>
            )}
            <input
              ref={(el) => { fileInputRef[1](el); }}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
            <div className={styles.photoBtns}>
              <button type="button" className={styles.photoBtn} onClick={() => (fileInputRef[0] as HTMLInputElement | null)?.click()}>
                Choose Photo
              </button>
              {photoBlob && (
                <button type="button" className={styles.photoBtn} onClick={() => setPhotoBlob(undefined)}>
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name *</label>
              <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name *</label>
              <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
        </div>
      </div>

      <CategoriesSection
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        toggleCategory={toggleCategory}
      />

      <KeyDatesSection
        birthday={birthday}
        setBirthday={setBirthday}
        anniversary={anniversary}
        setAnniversary={setAnniversary}
        customDates={customDates}
        setCustomDates={setCustomDates}
      />

      <FamilySection
        spousePartner={spousePartner}
        setSpousePartner={setSpousePartner}
        children={children}
        setChildren={setChildren}
        pets={pets}
        setPets={setPets}
      />

      {/* Work & Life — simplified */}
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
        </div>
      </div>

      {/* Conversation Memory */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Conversation Memory</h2>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.label}>Life Updates</label>
            <textarea className={styles.textarea} value={lifeUpdates} onChange={(e) => setLifeUpdates(e.target.value)} placeholder="Recent life events, changes, news..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>General Notes</label>
            <textarea className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else worth remembering..." />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={!firstName.trim() || !lastName.trim()}>
          {isEditing ? 'Save Changes' : 'Add Person'}
        </button>
      </div>
    </form>
  );
}

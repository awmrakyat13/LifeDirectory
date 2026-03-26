import { useState, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { usePersonActions } from '../../hooks/usePeople';
import type { Person, Child, Pet, ContactEntry, SocialMediaEntry, NamedDate } from '../../models/types';
import styles from './PersonForm.module.css';

interface PersonFormProps {
  initialData?: Person;
  initialCategoryIds?: string[];
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={styles.tagsInput} onClick={() => inputRef.current?.focus()}>
      {value.map((tag, i) => (
        <span key={i} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.tagRemove}
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className={styles.tagInput}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}

export function PersonForm({ initialData, initialCategoryIds }: PersonFormProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { addPerson, updatePerson } = usePersonActions();
  const isEditing = !!initialData;

  const [firstName, setFirstName] = useState(initialData?.firstName ?? '');
  const [lastName, setLastName] = useState(initialData?.lastName ?? '');
  const [nickname, setNickname] = useState(initialData?.nickname ?? '');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(initialData?.photoBlob);
  const [relationshipLabel, setRelationshipLabel] = useState(initialData?.relationshipLabel ?? '');
  const [howWeMet, setHowWeMet] = useState(initialData?.howWeMet ?? '');

  const [birthday, setBirthday] = useState(initialData?.birthday ?? '');
  const [anniversary, setAnniversary] = useState(initialData?.anniversary ?? '');
  const [customDates, setCustomDates] = useState<NamedDate[]>(initialData?.customDates ?? []);

  const [spousePartner, setSpousePartner] = useState(initialData?.spousePartner ?? '');
  const [children, setChildren] = useState<Child[]>(initialData?.children ?? []);
  const [pets, setPets] = useState<Pet[]>(initialData?.pets ?? []);

  const [occupation, setOccupation] = useState(initialData?.occupation ?? '');
  const [company, setCompany] = useState(initialData?.company ?? '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests ?? []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions ?? []);
  const [languages, setLanguages] = useState<string[]>(initialData?.languages ?? []);

  const [phones, setPhones] = useState<ContactEntry[]>(initialData?.phones ?? []);
  const [emails, setEmails] = useState<ContactEntry[]>(initialData?.emails ?? []);
  const [socialMedia, setSocialMedia] = useState<SocialMediaEntry[]>(initialData?.socialMedia ?? []);
  const [address, setAddress] = useState(initialData?.address ?? '');

  const [lifeUpdates, setLifeUpdates] = useState(initialData?.lifeUpdates ?? '');
  const [topicsToBringUp, setTopicsToBringUp] = useState<string[]>(initialData?.topicsToBringUp ?? []);
  const [giftIdeas, setGiftIdeas] = useState<string[]>(initialData?.giftIdeas ?? []);
  const [sensitiveTopics, setSensitiveTopics] = useState<string[]>(initialData?.sensitiveTopics ?? []);
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds ?? []);
  const [isFavorite] = useState(initialData?.isFavorite ?? false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoBlob(file);
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
      nickname: nickname || undefined,
      photoBlob,
      relationshipLabel: relationshipLabel || undefined,
      howWeMet: howWeMet || undefined,
      birthday: birthday || undefined,
      anniversary: anniversary || undefined,
      customDates: customDates.length > 0 ? customDates : undefined,
      spousePartner: spousePartner || undefined,
      children: children.length > 0 ? children : undefined,
      pets: pets.length > 0 ? pets : undefined,
      linkedPersonIds: initialData?.linkedPersonIds,
      occupation: occupation || undefined,
      company: company || undefined,
      interests: interests.length > 0 ? interests : undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      languages: languages.length > 0 ? languages : undefined,
      phones: phones.length > 0 ? phones : undefined,
      emails: emails.length > 0 ? emails : undefined,
      socialMedia: socialMedia.length > 0 ? socialMedia : undefined,
      address: address || undefined,
      lastInteractionDate: initialData?.lastInteractionDate,
      lifeUpdates: lifeUpdates || undefined,
      topicsToBringUp: topicsToBringUp.length > 0 ? topicsToBringUp : undefined,
      giftIdeas: giftIdeas.length > 0 ? giftIdeas : undefined,
      sensitiveTopics: sensitiveTopics.length > 0 ? sensitiveTopics : undefined,
      notes: notes || undefined,
      isFavorite,
    };

    if (isEditing) {
      await updatePerson(initialData.id, personData, selectedCategoryIds);
      navigate(`/people/${initialData.id}`);
    } else {
      const id = await addPerson(personData, selectedCategoryIds);
      navigate(`/people/${id}`);
    }
  }

  const photoUrl = photoBlob ? URL.createObjectURL(photoBlob) : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Person' : 'Add Person'}</h1>
      </div>

      {/* Photo + Identity */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Identity</h2>
        <div className={styles.fieldGroup}>
          <div className={styles.photoSection}>
            {photoUrl ? (
              <img className={styles.photoPreview} src={photoUrl} alt="Photo" />
            ) : (
              <div className={styles.photoPlaceholder}>+</div>
            )}
            <div className={styles.photoBtns}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              <button type="button" className={styles.photoBtn} onClick={() => fileInputRef.current?.click()}>
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

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Nickname</label>
              <input className={styles.input} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="How they like to be called" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Relationship</label>
              <input className={styles.input} value={relationshipLabel} onChange={(e) => setRelationshipLabel(e.target.value)} placeholder="e.g. Cousin, Team Lead" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>How We Met</label>
            <input className={styles.input} value={howWeMet} onChange={(e) => setHowWeMet(e.target.value)} placeholder="Where/how you first met" />
          </div>
        </div>
      </div>

      {/* Categories */}
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

      {/* Key Dates */}
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

      {/* Family */}
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

      {/* Work & Life */}
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

      {/* Contact */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact</h2>
        <div className={styles.fieldGroup}>
          <div className={styles.arrayField}>
            <label className={styles.label}>Phone Numbers</label>
            {phones.map((p, i) => (
              <div key={i} className={styles.arrayItem}>
                <input className={styles.input} placeholder="Label" value={p.label} onChange={(e) => {
                  const next = [...phones];
                  next[i] = { ...p, label: e.target.value };
                  setPhones(next);
                }} style={{ maxWidth: 120 }} />
                <input className={styles.input} placeholder="Number" value={p.value} onChange={(e) => {
                  const next = [...phones];
                  next[i] = { ...p, value: e.target.value };
                  setPhones(next);
                }} />
                <button type="button" className={styles.removeBtn} onClick={() => setPhones(phones.filter((_, idx) => idx !== i))}>&times;</button>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => setPhones([...phones, { label: 'Mobile', value: '' }])}>+ Add Phone</button>
          </div>

          <div className={styles.arrayField}>
            <label className={styles.label}>Email Addresses</label>
            {emails.map((e, i) => (
              <div key={i} className={styles.arrayItem}>
                <input className={styles.input} placeholder="Label" value={e.label} onChange={(ev) => {
                  const next = [...emails];
                  next[i] = { ...e, label: ev.target.value };
                  setEmails(next);
                }} style={{ maxWidth: 120 }} />
                <input className={styles.input} type="email" placeholder="Email" value={e.value} onChange={(ev) => {
                  const next = [...emails];
                  next[i] = { ...e, value: ev.target.value };
                  setEmails(next);
                }} />
                <button type="button" className={styles.removeBtn} onClick={() => setEmails(emails.filter((_, idx) => idx !== i))}>&times;</button>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => setEmails([...emails, { label: 'Personal', value: '' }])}>+ Add Email</button>
          </div>

          <div className={styles.arrayField}>
            <label className={styles.label}>Social Media</label>
            {socialMedia.map((s, i) => (
              <div key={i} className={styles.arrayItem}>
                <input className={styles.input} placeholder="Platform" value={s.platform} onChange={(e) => {
                  const next = [...socialMedia];
                  next[i] = { ...s, platform: e.target.value };
                  setSocialMedia(next);
                }} style={{ maxWidth: 120 }} />
                <input className={styles.input} placeholder="Handle / URL" value={s.handle} onChange={(e) => {
                  const next = [...socialMedia];
                  next[i] = { ...s, handle: e.target.value };
                  setSocialMedia(next);
                }} />
                <button type="button" className={styles.removeBtn} onClick={() => setSocialMedia(socialMedia.filter((_, idx) => idx !== i))}>&times;</button>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => setSocialMedia([...socialMedia, { platform: '', handle: '' }])}>+ Add Social</button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Address</label>
            <textarea className={styles.textarea} value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
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

      {/* Actions */}
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

import { useRef } from 'react';
import styles from '../PersonForm.module.css';

interface IdentitySectionProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  nickname: string;
  setNickname: (val: string) => void;
  relationshipLabel: string;
  setRelationshipLabel: (val: string) => void;
  howWeMet: string;
  setHowWeMet: (val: string) => void;
  photoBlob: Blob | undefined;
  setPhotoBlob: (val: Blob | undefined) => void;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function IdentitySection({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  nickname,
  setNickname,
  relationshipLabel,
  setRelationshipLabel,
  howWeMet,
  setHowWeMet,
  photoBlob,
  setPhotoBlob,
  onPhotoSelect,
}: IdentitySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUrl = photoBlob ? URL.createObjectURL(photoBlob) : null;

  return (
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
              onChange={onPhotoSelect}
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
  );
}

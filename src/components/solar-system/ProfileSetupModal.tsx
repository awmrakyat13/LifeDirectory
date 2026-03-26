import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { compressImage } from '../../utils/image';
import { db } from '../../db/database';
import styles from './ProfileSetupModal.module.css';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPhotoBlob(compressed);
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(URL.createObjectURL(compressed));
    }
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    await db.settings.update('singleton', {
      myName: name.trim(),
      myPhotoBlob: photoBlob,
    });
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    onComplete();
  }

  function handleSkip() {
    db.settings.update('singleton', { myName: 'Me' });
    onComplete();
  }

  return (
    <Modal title="Welcome to Life Directory" onClose={handleSkip} hideClose>
      <div className={styles.form}>
        <div className={styles.photoSection}>
          {photoUrl ? (
            <img className={styles.photoPreview} src={photoUrl} alt="Your photo" />
          ) : (
            <div
              className={styles.photoPlaceholder}
              onClick={() => fileRef.current?.click()}
            >
              +
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
          <button type="button" className={styles.photoBtn} onClick={() => fileRef.current?.click()}>
            {photoBlob ? 'Change Photo' : 'Add Photo'}
          </button>
        </div>

        <div className={styles.nameField}>
          <label className={styles.label}>Your Name</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </div>

        <button
          className={styles.startBtn}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Get Started
        </button>
        <button className={styles.skipBtn} onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </Modal>
  );
}

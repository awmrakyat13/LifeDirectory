import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { compressImage } from '../../utils/image';
import { useAuth } from '../../hooks/useAuth';
import { createUserProfile, type UserProfile } from '../../firebase/firestore';
import styles from './ProfileSetupModal.module.css';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !user) return;
    setLoading(true);

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      name: name.trim(),
      photoUrl,
      phone: phone || undefined,
      birthday: birthday || undefined,
      createdAt: new Date().toISOString(),
    };

    await createUserProfile(user.uid, profile);
    setLoading(false);
    onComplete();
  }

  function handleSkip() {
    if (!user) return;
    createUserProfile(user.uid, {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || 'Me',
      createdAt: new Date().toISOString(),
    });
    onComplete();
  }

  return (
    <Modal title="Set Up Your Profile" onClose={handleSkip} hideClose>
      <div className={styles.form}>
        <div className={styles.photoSection}>
          {photoUrl ? (
            <img className={styles.photoPreview} src={photoUrl} alt="Your photo" onClick={() => fileRef.current?.click()} />
          ) : (
            <div className={styles.photoPlaceholder} onClick={() => fileRef.current?.click()}>+</div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
          <button type="button" className={styles.photoBtn} onClick={() => fileRef.current?.click()}>
            {photoUrl ? 'Change Photo' : 'Add Photo'}
          </button>
        </div>

        <div className={styles.nameField}>
          <label className={styles.label}>Your Name *</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" autoFocus />
        </div>

        <div className={styles.nameField}>
          <label className={styles.label}>Phone</label>
          <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" type="tel" />
        </div>

        <div className={styles.nameField}>
          <label className={styles.label}>Birthday</label>
          <input className={styles.input} value={birthday} onChange={(e) => setBirthday(e.target.value)} type="date" />
        </div>

        <button className={styles.startBtn} onClick={handleSubmit} disabled={!name.trim() || loading}>
          {loading ? 'Saving...' : 'Get Started'}
        </button>
        <button className={styles.skipBtn} onClick={handleSkip}>Skip for now</button>
      </div>
    </Modal>
  );
}

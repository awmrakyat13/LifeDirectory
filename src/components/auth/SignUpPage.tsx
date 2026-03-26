import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createUserProfile, type UserProfile } from '../../firebase/firestore';
import { compressImage } from '../../utils/image';
import styles from './LoginPage.module.css';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
}

export function SignUpPage({ onSwitchToLogin }: SignUpPageProps) {
  const { signUp, googleSignIn } = useAuth();
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [occupation, setOccupation] = useState('');
  const [company, setCompany] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUid = await signUp(email, password);
      setUid(newUid);
      setStep('profile');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError('');
    try {
      await googleSignIn();
      // For Google sign-in, we'll handle profile in the main app
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      // Convert to base64 for Firestore storage
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const profile: UserProfile = {
      uid,
      email,
      name: name.trim(),
      photoUrl,
      phone: phone || undefined,
      birthday: birthday || undefined,
      occupation: occupation || undefined,
      company: company || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await createUserProfile(uid, profile);
      // Auth state change will redirect to the app
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Profile setup failed';
      setError(msg);
    }
    setLoading(false);
  }

  if (step === 'profile') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>Set Up Your Profile</div>
          <div className={styles.subtitle}>This info can be shared with your connections</div>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <div className={styles.field} style={{ alignItems: 'center' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Photo" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => fileRef.current?.click()} />
              ) : (
                <div
                  style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
                  onClick={() => fileRef.current?.click()}
                >+</div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" type="tel" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Birthday</label>
              <input className={styles.input} value={birthday} onChange={(e) => setBirthday(e.target.value)} type="date" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Occupation</label>
              <input className={styles.input} value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Optional" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Company</label>
              <input className={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
            </div>

            <button className={styles.submitBtn} type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>Life Directory</div>
        <div className={styles.subtitle}>Create your account</div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleCredentials}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          Sign up with Google
        </button>

        <div className={styles.switchText}>
          Already have an account?{' '}
          <button className={styles.switchLink} onClick={onSwitchToLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

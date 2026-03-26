import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useTheme } from '../hooks/useTheme';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useAuth } from '../hooks/useAuth';
import { useAppSettings } from '../hooks/useAppSettings';
import { exportData, importData, previewImport, exportCategory } from '../db/backup';
import { compressImage } from '../utils/image';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { Avatar } from '../components/ui/Avatar';
import { useCategories } from '../hooks/useCategories';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const { toast } = useToast();
  const { categories } = useCategories();
  const { settings: appSettings, updateSettings } = useAppSettings();
  const profileFileRef = useRef<HTMLInputElement>(null);
  const settings = useLiveQuery(() => db.settings.get('singleton'));
  const nudgeDays = settings?.nudgeDays ?? 30;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{ people: number; categories: number; interactions: number } | null>(null);

  async function handleNudgeDaysChange(value: number) {
    await db.settings.update('singleton', { nudgeDays: value });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      try {
        const preview = await previewImport(file);
        setImportPreview(preview);
      } catch {
        setImportPreview(null);
      }
      setShowImportConfirm(true);
    }
    e.target.value = '';
  }

  async function handleImport() {
    if (!importFile) return;
    try {
      await importData(importFile);
      toast('Data imported successfully', 'success');
    } catch {
      toast('Failed to import data. Invalid file format.', 'error');
    }
    setShowImportConfirm(false);
    setImportFile(null);
    setImportPreview(null);
  }

  async function handleExport() {
    await exportData();
    toast('Backup exported', 'success');
  }

  async function handleExportCategory(categoryId: string, categoryName: string) {
    await exportCategory(categoryId);
    toast(`Exported "${categoryName}" people`, 'success');
  }

  async function handleClearAll() {
    if (!user) return;
    // Clear all Firestore collections for this user
    const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
    const { firestore } = await import('../firebase/config');
    const collections = ['people', 'categories', 'personCategories', 'interactions'];
    for (const col of collections) {
      const snap = await getDocs(collection(firestore, 'users', user.uid, col));
      for (const d of snap.docs) await deleteDoc(d.ref);
    }
    // Re-seed default categories
    const { seedUserCategories } = await import('../firebase/seedUserData');
    await seedUserCategories(user.uid);
    toast('All data cleared', 'info');
    setShowClearConfirm(false);
  }

  return (
    <div className={styles.container}>
      <h1>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>My Profile</h2>
        <div className={styles.profileRow}>
          <div className={styles.profileAvatar} onClick={() => profileFileRef.current?.click()}>
            <Avatar
              photoBlob={appSettings?.myPhotoBlob}
              firstName={appSettings?.myName?.split(' ')[0] || 'M'}
              lastName={appSettings?.myName?.split(' ')[1] || 'e'}
              size={64}
            />
          </div>
          <div className={styles.profileFields}>
            <input
              className={styles.profileInput}
              value={appSettings?.myName ?? ''}
              onChange={(e) => updateSettings({ myName: e.target.value })}
              placeholder="Your name"
            />
            <input
              ref={profileFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const compressed = await compressImage(file);
                  await updateSettings({ myPhotoBlob: compressed });
                  toast('Profile photo updated', 'success');
                }
                e.target.value = '';
              }}
            />
            <button className={styles.dataBtn} onClick={() => profileFileRef.current?.click()}>
              Change Photo
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <div className={styles.field}>
          <label className={styles.label}>Theme</label>
          <div className={styles.themeOptions}>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                className={`${styles.themeBtn} ${theme === t ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme(t)}
              >
                {t === 'light' ? 'Light' : t === 'dark' ? 'Dark' : 'System'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reminders</h2>
        <div className={styles.field}>
          <label className={styles.label}>
            Nudge after days without contact
          </label>
          <div className={styles.nudgeControl}>
            <input
              type="range"
              min="7"
              max="90"
              step="1"
              value={nudgeDays}
              onChange={(e) => handleNudgeDaysChange(parseInt(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.nudgeValue}>{nudgeDays} days</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data</h2>
        <div className={styles.dataActions}>
          <button className={styles.dataBtn} onClick={handleExport}>
            Export All (JSON)
          </button>
          <button className={styles.dataBtn} onClick={() => fileInputRef.current?.click()}>
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
        {categories.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <label className={styles.label}>Export by category</label>
            <div className={styles.dataActions}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={styles.dataBtn}
                  onClick={() => handleExportCategory(cat.id, cat.name)}
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Install App</h2>
        {isInstalled ? (
          <p className={styles.about}>Life Directory is installed on this device.</p>
        ) : canInstall ? (
          <div>
            <p className={styles.about} style={{ marginBottom: 'var(--space-md)' }}>
              Install Life Directory on your device for quick access and offline use.
            </p>
            <button className={styles.installBtn} onClick={install}>
              Install App
            </button>
          </div>
        ) : (
          <div className={styles.about}>
            <p>To install on your phone:</p>
            <ol className={styles.installSteps}>
              <li><strong>iPhone/iPad:</strong> Tap the Share button, then "Add to Home Screen"</li>
              <li><strong>Android:</strong> Tap the menu (three dots), then "Add to Home Screen" or "Install App"</li>
              <li><strong>Desktop:</strong> Look for the install icon in your browser's address bar</li>
            </ol>
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.dangerSection}`}>
        <h2 className={styles.sectionTitle}>Danger Zone</h2>
        <p className={styles.about} style={{ marginBottom: 'var(--space-md)' }}>
          This will permanently delete all people, categories, interactions, and your profile. Default categories will be re-created.
        </p>
        <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)}>
          Clear All Data
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <p className={styles.about}>
          Life Directory v1.0.0<br />
          A personal people directory PWA.<br />
          All data is stored locally on your device.
        </p>
      </section>

      {showClearConfirm && (
        <ConfirmDialog
          title="Clear All Data"
          message="This will permanently delete ALL people, categories, interactions, and your profile. This cannot be undone. Are you sure?"
          confirmLabel="Clear Everything"
          danger
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {showImportConfirm && (
        <ConfirmDialog
          title="Import Data"
          message={
            importPreview
              ? `This backup contains ${importPreview.people} people, ${importPreview.categories} categories, and ${importPreview.interactions} interactions. Importing will replace ALL existing data. This cannot be undone.`
              : 'This will replace ALL existing data with the imported backup. This cannot be undone. Are you sure?'
          }
          confirmLabel="Import"
          danger
          onConfirm={handleImport}
          onCancel={() => { setShowImportConfirm(false); setImportFile(null); setImportPreview(null); }}
        />
      )}
    </div>
  );
}

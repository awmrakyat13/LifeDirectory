import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useTheme } from '../hooks/useTheme';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { exportData, importData } from '../db/backup';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const settings = useLiveQuery(() => db.settings.get('singleton'));
  const nudgeDays = settings?.nudgeDays ?? 30;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState('');

  async function handleNudgeDaysChange(value: number) {
    await db.settings.update('singleton', { nudgeDays: value });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportConfirm(true);
    }
    e.target.value = '';
  }

  async function handleImport() {
    if (!importFile) return;
    try {
      await importData(importFile);
      setImportStatus('Data imported successfully!');
    } catch {
      setImportStatus('Failed to import data. Invalid file format.');
    }
    setShowImportConfirm(false);
    setImportFile(null);
    setTimeout(() => setImportStatus(''), 3000);
  }

  return (
    <div className={styles.container}>
      <h1>Settings</h1>

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
          <button className={styles.dataBtn} onClick={exportData}>
            Export Backup (JSON)
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
        {importStatus && (
          <p className={styles.statusMsg}>{importStatus}</p>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <p className={styles.about}>
          Life Directory v1.0.0<br />
          A personal people directory PWA.<br />
          All data is stored locally on your device.
        </p>
      </section>

      {showImportConfirm && (
        <ConfirmDialog
          title="Import Data"
          message="This will replace ALL existing data with the imported backup. This cannot be undone. Are you sure?"
          confirmLabel="Import"
          danger
          onConfirm={handleImport}
          onCancel={() => { setShowImportConfirm(false); setImportFile(null); }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import styles from './InstallBanner.module.css';

export function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>{'\u{1F4F2}'}</span>
      <div className={styles.text}>
        <div className={styles.title}>Install Life Directory</div>
        <div className={styles.subtitle}>Add to your home screen for quick access</div>
      </div>
      <button className={styles.installBtn} onClick={install}>
        Install
      </button>
      <button
        className={styles.dismissBtn}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}

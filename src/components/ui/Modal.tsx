import { useEffect, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  hideClose?: boolean;
}

export function Modal({ title, onClose, children, hideClose }: ModalProps) {
  useEffect(() => {
    if (hideClose) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose, hideClose]);

  return (
    <div className={styles.overlay} onClick={hideClose ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {!hideClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              &times;
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

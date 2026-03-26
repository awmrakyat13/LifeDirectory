import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  onUndo?: () => void;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, options?: { duration?: number; onUndo?: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((
    message: string,
    type: ToastType = 'success',
    options?: { duration?: number; onUndo?: () => void }
  ) => {
    const id = nextId++;
    const duration = options?.duration ?? 3000;
    setToasts((prev) => [...prev, { id, message, type, duration, onUndo: options?.onUndo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type]}`}
            style={{ '--toast-duration': `${t.duration - 300}ms` } as React.CSSProperties}
          >
            <span className={styles.message}>{t.message}</span>
            {t.onUndo && (
              <button
                className={styles.undoBtn}
                onClick={() => {
                  t.onUndo?.();
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
                }}
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

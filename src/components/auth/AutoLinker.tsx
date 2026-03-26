import { type ReactNode } from 'react';
import { useAutoLink } from '../../hooks/useAutoLink';

export function AutoLinker({ children }: { children: ReactNode }) {
  useAutoLink();
  return <>{children}</>;
}

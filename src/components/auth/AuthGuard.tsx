import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { seedUserCategories } from '../../firebase/seedUserData';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { Skeleton } from '../ui/Skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (user && !seeded) {
      seedUserCategories(user.uid).then(() => setSeeded(true));
    }
    if (!user) setSeeded(false);
  }, [user, seeded]);

  if (loading || (user && !seeded)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Skeleton width={60} height={60} circle />
          <Skeleton width={200} height={16} />
        </div>
      </div>
    );
  }

  if (!user) {
    if (mode === 'signup') {
      return <SignUpPage onSwitchToLogin={() => setMode('login')} />;
    }
    return <LoginPage onSwitchToSignUp={() => setMode('signup')} />;
  }

  return <>{children}</>;
}

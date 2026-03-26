import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
}

export function Skeleton({ width = '100%', height = 16, circle }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${circle ? styles.circle : ''}`}
      style={{ width, height }}
    />
  );
}

export function PersonCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton width={48} height={48} circle />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
}

export function PersonCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
    </div>
  );
}

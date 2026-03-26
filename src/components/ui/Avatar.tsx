import { useState, useEffect } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  photoBlob?: Blob;
  firstName: string;
  lastName: string;
  size?: number;
}

const AVATAR_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ photoBlob, firstName, lastName, size = 40 }: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photoBlob) {
      const url = URL.createObjectURL(photoBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
    }
  }, [photoBlob]);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const bgColor = getColorForName(`${firstName}${lastName}`);

  if (imageUrl) {
    return (
      <img
        className={styles.avatar}
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        width={size}
        height={size}
      />
    );
  }

  return (
    <div
      className={styles.placeholder}
      style={{
        width: size,
        height: size,
        background: bgColor,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
}

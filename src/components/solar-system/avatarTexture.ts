import * as THREE from 'three';

const COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function createAvatarTexture(
  firstName: string,
  lastName: string,
  size: number = 256
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const color = getColor(`${firstName}${lastName}`);
  const r = size / 2;

  // Subtle gradient background
  const grad = ctx.createRadialGradient(r, r * 0.8, 0, r, r, r);
  grad.addColorStop(0, lighten(color, 20));
  grad.addColorStop(1, color);
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle inner shadow
  const shadow = ctx.createRadialGradient(r, r, r * 0.7, r, r, r);
  shadow.addColorStop(0, 'rgba(0,0,0,0)');
  shadow.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = shadow;
  ctx.fill();

  // Initials with dark outline for contrast on any background
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fontSize = size * 0.38;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dark stroke outline
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = size * 0.025;
  ctx.lineJoin = 'round';
  ctx.strokeText(initials, r, r);

  // White fill
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = size * 0.05;
  ctx.shadowOffsetY = size * 0.015;
  ctx.fillStyle = 'white';
  ctx.fillText(initials, r, r);

  // Rim highlight
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createPhotoTexture(blob: Blob, size: number = 256): Promise<THREE.CanvasTexture> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Draw image covering the circle
      const aspect = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (aspect > 1) {
        sx = (img.width - img.height) / 2;
        sw = img.height;
      } else {
        sy = (img.height - img.width) / 2;
        sh = img.width;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

      // Rim highlight
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      resolve(texture);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(createAvatarTexture('?', '?', size));
    };
    img.src = url;
  });
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

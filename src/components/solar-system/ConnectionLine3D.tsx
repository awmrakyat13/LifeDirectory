import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { SOLAR } from '../../constants/solarSystem';

interface ConnectionLine3DProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'linked' | 'company';
  isHighlighted: boolean;
}

export function ConnectionLine3D({ from, to, type, isHighlighted }: ConnectionLine3DProps) {
  const color = type === 'linked' ? '#5DADE2' : '#9B59B6';
  const opacity = isHighlighted ? SOLAR.LINE_HOVER_OPACITY : SOLAR.LINE_OPACITY;

  const points = useMemo((): [THREE.Vector3, THREE.Vector3] => [
    new THREE.Vector3(from.x * 0.1, from.y * 0.1, 0),
    new THREE.Vector3(to.x * 0.1, to.y * 0.1, 0),
  ], [from.x, from.y, to.x, to.y]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={type === 'linked' ? 1.5 : 1}
      transparent
      opacity={opacity}
    />
  );
}

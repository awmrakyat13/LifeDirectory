import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitRing } from '../../utils/orbitCalculator';

interface OrbitRing3DProps {
  ring: OrbitRing;
}

export function OrbitRing3D({ ring }: OrbitRing3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = ring.radius * 0.1;
  const segments = 128;
  const speed = 0.02 / (ring.ring + 1);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += speed * 0.01;
    }
  });

  const ringPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  const arcPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const arcLen = Math.floor(segments * 0.15);
    for (let i = 0; i <= arcLen; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  return (
    <group ref={groupRef}>
      <Line points={ringPoints} color={ring.color} lineWidth={0.5} transparent opacity={0.1} />
      <Line points={arcPoints} color={ring.color} lineWidth={1.5} transparent opacity={0.4} />
    </group>
  );
}

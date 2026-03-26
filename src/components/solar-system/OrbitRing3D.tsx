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
  const arcGroupRef = useRef<THREE.Group>(null);
  const radius = ring.radius * 0.1;
  const segments = 192;

  useFrame(() => {
    // Full ring slowly rotates
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0001 / (ring.ring + 1);
    }
    // Accent arc rotates faster
    if (arcGroupRef.current) {
      arcGroupRef.current.rotation.z += 0.0008 / (ring.ring + 1);
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
    const arcLen = Math.floor(segments * 0.12);
    for (let i = 0; i <= arcLen; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  // Second accent arc on opposite side
  const arc2Points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const arcLen = Math.floor(segments * 0.06);
    const offset = Math.PI;
    for (let i = 0; i <= arcLen; i++) {
      const angle = offset + (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  return (
    <>
      <group ref={groupRef}>
        <Line points={ringPoints} color={ring.color} lineWidth={0.6} transparent opacity={0.06} />
      </group>
      <group ref={arcGroupRef}>
        <Line points={arcPoints} color={ring.color} lineWidth={2} transparent opacity={0.5} />
        <Line points={arc2Points} color={ring.color} lineWidth={1.2} transparent opacity={0.25} />
      </group>
    </>
  );
}

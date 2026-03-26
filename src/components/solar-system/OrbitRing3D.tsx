import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitRing } from '../../utils/orbitCalculator';

interface OrbitRing3DProps {
  ring: OrbitRing;
}

// Each ring gets a unique tilt based on its index
export function getRingTilt(ringNum: number): [number, number, number] {
  const tilts: [number, number, number][] = [
    [0, 0, 0],                          // ring 0 (center, unused)
    [0.15, 0.1, 0],                     // ring 1 — slight forward tilt
    [-0.1, 0, 0.12],                    // ring 2 — slight back + roll
    [0.08, -0.15, -0.08],              // ring 3
    [-0.12, 0.08, 0.15],              // ring 4
    [0.18, -0.1, -0.05],              // ring 5
    [-0.05, 0.18, 0.1],               // ring 6
    [0.1, -0.05, -0.18],              // ring 7
    [-0.15, 0.12, 0.05],              // ring 8
  ];
  return tilts[ringNum] || [
    Math.sin(ringNum * 1.7) * 0.15,
    Math.cos(ringNum * 2.3) * 0.15,
    Math.sin(ringNum * 3.1) * 0.1,
  ];
}

export function OrbitRing3D({ ring }: OrbitRing3DProps) {
  const arcGroupRef = useRef<THREE.Group>(null);
  const radius = ring.radius * 0.1;
  const tubeRadius = 0.03;
  const segments = 128;
  const tilt = getRingTilt(ring.ring);

  useFrame(() => {
    if (arcGroupRef.current) {
      arcGroupRef.current.rotation.z += 0.0005 / (ring.ring + 1);
    }
  });

  const ringColor = useMemo(() => new THREE.Color(ring.color), [ring.color]);

  const arcCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const arcLen = Math.floor(segments * 0.15);
    for (let i = 0; i <= arcLen; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [radius]);

  const arc2Curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const arcLen = Math.floor(segments * 0.07);
    for (let i = 0; i <= arcLen; i++) {
      const angle = Math.PI + (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [radius]);

  return (
    <group rotation={tilt} position={[0, 0, -1.5]}>
      {/* Full orbit path */}
      <mesh>
        <torusGeometry args={[radius, tubeRadius, 6, segments]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.12} />
      </mesh>

      {/* Rotating accent arcs */}
      <group ref={arcGroupRef}>
        <mesh>
          <tubeGeometry args={[arcCurve, 32, tubeRadius * 3, 8, false]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.45} />
        </mesh>
        <mesh>
          <tubeGeometry args={[arc2Curve, 20, tubeRadius * 2, 8, false]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

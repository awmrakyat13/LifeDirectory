import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitRing } from '../../utils/orbitCalculator';

interface OrbitRing3DProps {
  ring: OrbitRing;
}

export function OrbitRing3D({ ring }: OrbitRing3DProps) {
  const arcGroupRef = useRef<THREE.Group>(null);
  const radius = ring.radius * 0.1;
  const tubeRadius = 0.03;
  const segments = 128;

  useFrame(() => {
    if (arcGroupRef.current) {
      arcGroupRef.current.rotation.z += 0.0005 / (ring.ring + 1);
    }
  });

  // Full orbit ring as a thin torus
  const ringColor = useMemo(() => new THREE.Color(ring.color), [ring.color]);

  // Accent arc curve (15% of the circle)
  const arcCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const arcLen = Math.floor(segments * 0.15);
    for (let i = 0; i <= arcLen; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [radius]);

  // Secondary smaller arc on opposite side
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
    <>
      {/* Full orbit path — thin glowing torus */}
      <mesh>
        <torusGeometry args={[radius, tubeRadius, 6, segments]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.12} />
      </mesh>

      {/* Rotating accent arcs — thicker tubes */}
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
    </>
  );
}

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createAvatarTexture, createPhotoTexture } from './avatarTexture';
import { getRingTilt } from './OrbitRing3D';
import type { OrbitNode as OrbitNodeType } from '../../utils/orbitCalculator';

interface OrbitNode3DProps {
  node: OrbitNodeType;
  isCenter: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

function getNodeRadius(ring: number, isCenter: boolean): number {
  if (isCenter) return 3.5;
  const base = 2.2;
  return base * Math.max(0.6, 1 - ring * 0.08);
}

export function OrbitNode3D({ node, isCenter, isHovered, onHover, onClick }: OrbitNode3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  const nameParts = node.label.split(' ');
  const firstName = nameParts[0] || 'M';
  const lastName = nameParts.slice(1).join(' ') || 'e';

  useEffect(() => {
    if (node.photoBlob) {
      createPhotoTexture(node.photoBlob, 256).then(setTexture);
    } else {
      setTexture(createAvatarTexture(firstName, lastName, 256));
    }
  }, [node.photoBlob, firstName, lastName]);

  const radius = getNodeRadius(node.ring, isCenter);

  const edgeColor = useMemo(() => {
    if (isCenter) return new THREE.Color('#F39C12');
    if (node.categoryColor) return new THREE.Color(node.categoryColor);
    return new THREE.Color('#4A90D9');
  }, [isCenter, node.categoryColor]);

  const spriteMat = useMemo(() => {
    if (!texture) return null;
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.z = pos[2] + Math.sin(t * 0.25 + node.angle * 3) * 0.2;
      const target = isHovered && !isCenter ? 1.12 : 1;
      const s = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(s + (target - s) * 0.08);
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCenter
        ? 0.06 + Math.sin(t * 0.8) * 0.02
        : (isHovered ? 0.05 : 0.015);
    }
  });

  // Apply ring tilt to node position so nodes sit on their tilted ring
  const pos: [number, number, number] = useMemo(() => {
    const flatPos = new THREE.Vector3(node.x * 0.1, node.y * 0.1, 0);
    if (isCenter || node.ring === 0) return [flatPos.x, flatPos.y, flatPos.z];
    const tilt = getRingTilt(node.ring);
    const euler = new THREE.Euler(tilt[0], tilt[1], tilt[2]);
    flatPos.applyEuler(euler);
    return [flatPos.x, flatPos.y, flatPos.z];
  }, [node.x, node.y, node.ring, isCenter]);

  if (!texture) return null;

  return (
    <group ref={groupRef} position={pos}>
      {/* Soft glow sphere behind avatar */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.15, 24, 24]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>

      {/* Category/center ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.55, 0.04, 8, 48]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={isCenter ? 0.4 : 0.3} />
      </mesh>

      {/* Avatar sprite */}
      {spriteMat && (
        <sprite
          material={spriteMat}
          scale={[radius * 0.9, radius * 0.9, 1]}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(node.id); document.body.style.cursor = 'pointer'; }}
          onPointerLeave={() => { onHover(null); document.body.style.cursor = 'default'; }}
          onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
        />
      )}

      {/* Badges as small torus outlines */}
      {node.isFavorite && !isCenter && (
        <mesh position={[radius * 0.35, radius * 0.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.07, 6, 16]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}
      {node.isOnPlatform && !isCenter && (
        <mesh position={[-radius * 0.35, radius * 0.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.07, 6, 16]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <mesh position={[radius * 0.35, -radius * 0.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.07, 6, 16]} />
          <meshBasicMaterial color="#2ECC71" />
        </mesh>
      )}

      {/* Name label on hover */}
      {(isHovered || isCenter) && (
        <Html
          center
          position={[0, -radius * 0.6, 0]}
          style={{
            color: 'white',
            fontSize: isCenter ? '13px' : '11px',
            fontWeight: isCenter ? 600 : 500,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            whiteSpace: 'nowrap',
            textShadow: '0 0 8px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {node.label}
          {node.isReadOnly && node.shareableInfo && (
            <span style={{ color: '#5DADE2', fontSize: '10px', marginLeft: 4 }}>+ add</span>
          )}
        </Html>
      )}
    </group>
  );
}

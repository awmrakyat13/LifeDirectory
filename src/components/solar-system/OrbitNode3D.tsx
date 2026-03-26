import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createAvatarTexture, createPhotoTexture } from './avatarTexture';
import type { OrbitNode as OrbitNodeType } from '../../utils/orbitCalculator';

interface OrbitNode3DProps {
  node: OrbitNodeType;
  isCenter: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

// Progressive size: center is 2x ring1, ring1 is 1.2x ring2, etc.
function getNodeRadius(ring: number, isCenter: boolean): number {
  if (isCenter) return 3.5;
  const base = 2.2;
  return base * Math.max(0.6, 1 - ring * 0.08);
}

export function OrbitNode3D({ node, isCenter, isHovered, onHover, onClick }: OrbitNode3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const edgeRef = useRef<THREE.Mesh>(null);
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
  const coinThickness = radius * 0.15;

  const edgeColor = useMemo(() => {
    if (isCenter) return new THREE.Color('#F39C12');
    if (node.categoryColor) return new THREE.Color(node.categoryColor);
    return new THREE.Color('#4A90D9');
  }, [isCenter, node.categoryColor]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Subtle float
      groupRef.current.position.z = Math.sin(t * 0.25 + node.angle * 3) * 0.2;
      // Always face camera with slight tilt toward it
      groupRef.current.rotation.x = Math.PI * 0.08;
      // Hover scale
      const target = isHovered && !isCenter ? 1.12 : 1;
      const s = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(s + (target - s) * 0.08);
    }
    // Edge glow on hover
    if (edgeRef.current) {
      const mat = edgeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isHovered ? 0.7 : (isCenter ? 0.5 : 0.3);
    }
  });

  if (!texture) return null;

  const pos: [number, number, number] = [node.x * 0.1, node.y * 0.1, 0];

  return (
    <group ref={groupRef} position={pos}>
      {/* Coin face — cylinder with avatar texture on both caps */}
      <mesh
        onPointerEnter={(e) => { e.stopPropagation(); onHover(node.id); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { onHover(null); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
      >
        <cylinderGeometry args={[radius, radius, coinThickness, 48, 1, false]} />
        <meshStandardMaterial
          map={texture}
          emissive={edgeColor}
          emissiveIntensity={isHovered ? 0.15 : 0.05}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Glowing edge ring */}
      <mesh ref={edgeRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, coinThickness * 0.4, 8, 48]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={0.3} />
      </mesh>

      {/* Center warm glow plane (additive) */}
      {isCenter && (
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[radius * 4, radius * 4]} />
          <meshBasicMaterial
            color="#F39C12"
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Badge: favorite — thin gold ring outline at top-right */}
      {node.isFavorite && !isCenter && (
        <mesh position={[radius * 0.6, coinThickness * 0.5, radius * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 6, 16]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}

      {/* Badge: platform user — thin blue ring outline at top-left */}
      {node.isOnPlatform && !isCenter && (
        <mesh position={[-radius * 0.6, coinThickness * 0.5, radius * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 6, 16]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Badge: add from circle */}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <mesh position={[radius * 0.6, coinThickness * 0.5, -radius * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 6, 16]} />
          <meshBasicMaterial color="#2ECC71" />
        </mesh>
      )}

      {/* Name label on hover */}
      {(isHovered || isCenter) && (
        <Html
          center
          position={[0, -coinThickness * 0.5, -radius - 0.8]}
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

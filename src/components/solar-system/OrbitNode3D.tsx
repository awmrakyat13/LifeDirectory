import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createAvatarTexture, createPhotoTexture } from './avatarTexture';
import { SOLAR } from '../../constants/solarSystem';
import type { OrbitNode as OrbitNodeType } from '../../utils/orbitCalculator';

interface OrbitNode3DProps {
  node: OrbitNodeType;
  isCenter: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function OrbitNode3D({ node, isCenter, isHovered, onHover, onClick }: OrbitNode3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
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

  // Depth scaling
  const depthScale = isCenter ? 1 : Math.max(0.75, 1 - node.ring * 0.05);
  const baseSize = isCenter ? SOLAR.CENTER_SIZE * 0.14 : SOLAR.NODE_SIZE * 0.12;
  const nodeSize = baseSize * depthScale;

  // Glow color
  const glowColor = useMemo(
    () => new THREE.Color(isCenter ? '#F39C12' : node.categoryColor || '#4A90D9'),
    [isCenter, node.categoryColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle floating
      groupRef.current.position.z = Math.sin(t * 0.4 + node.angle * 3) * 0.8;
      // Hover scale with smooth lerp
      const target = isHovered && !isCenter ? 1.25 : 1;
      const s = groupRef.current.scale.x;
      const next = s + (target - s) * 0.1;
      groupRef.current.scale.setScalar(next);
    }

    // Pulsing glow
    if (glowRef.current) {
      const pulse = isCenter ? 1 + Math.sin(t * 1.2) * 0.2 : 1 + Math.sin(t * 0.8 + node.angle) * 0.08;
      glowRef.current.scale.setScalar(pulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCenter ? 0.12 + Math.sin(t * 1.2) * 0.05 : (isHovered ? 0.12 : 0.06);
    }

    // Rotating category ring
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
    }
  });

  const spriteMat = useMemo(() => {
    if (!texture) return null;
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [texture]);

  if (!texture) return null;

  const pos: [number, number, number] = [node.x * 0.1, node.y * 0.1, 0];

  return (
    <group ref={groupRef} position={pos}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 1.8, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Category color ring (toroid) */}
      {node.categoryColor && !isCenter && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[nodeSize * 0.65, 0.08, 8, 64]} />
          <meshBasicMaterial color={node.categoryColor} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Center special rings */}
      {isCenter && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[nodeSize * 0.8, 0.06, 8, 64]} />
            <meshBasicMaterial color="#F39C12" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
            <torusGeometry args={[nodeSize * 1.0, 0.04, 8, 64]} />
            <meshBasicMaterial color="#E67E22" transparent opacity={0.2} />
          </mesh>
        </>
      )}

      {/* Avatar sprite */}
      {spriteMat && (
        <sprite
          material={spriteMat}
          scale={[nodeSize, nodeSize, 1]}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(node.id); document.body.style.cursor = 'pointer'; }}
          onPointerLeave={() => { onHover(null); document.body.style.cursor = 'default'; }}
          onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
        />
      )}

      {/* Favorite badge */}
      {node.isFavorite && !isCenter && (
        <mesh position={[nodeSize * 0.35, nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}

      {/* Platform badge */}
      {node.isOnPlatform && !isCenter && (
        <mesh position={[-nodeSize * 0.35, nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Add hint */}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <mesh position={[nodeSize * 0.35, -nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Name label */}
      {(isHovered || isCenter) && (
        <Html
          center
          position={[0, -nodeSize * 0.65, 0]}
          style={{
            color: 'white',
            fontSize: isCenter ? '14px' : '12px',
            fontWeight: isCenter ? 600 : 500,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            whiteSpace: 'nowrap',
            textShadow: '0 0 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.02em',
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

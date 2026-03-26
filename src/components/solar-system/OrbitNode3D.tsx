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
  scale3d: number;
}

export function OrbitNode3D({ node, isCenter, isHovered, onHover, onClick, scale3d }: OrbitNode3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  const nameParts = node.label.split(' ');
  const firstName = nameParts[0] || 'M';
  const lastName = nameParts.slice(1).join(' ') || 'e';

  // Create avatar texture
  useEffect(() => {
    if (node.photoBlob) {
      createPhotoTexture(node.photoBlob).then(setTexture);
    } else {
      setTexture(createAvatarTexture(firstName, lastName));
    }
  }, [node.photoBlob, firstName, lastName]);

  // Depth scaling
  const depthScale = isCenter ? 1 : Math.max(0.7, 1 - node.ring * 0.06);
  const baseSize = isCenter ? 8 : 5;
  const nodeSize = baseSize * depthScale * scale3d;

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.z = Math.sin(t * 0.5 + node.angle * 3) * 1.5;

      // Hover scale
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    if (glowRef.current && isCenter) {
      const t = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(t * 1.5) * 0.15;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Glow color
  const glowColor = isCenter ? '#F39C12' : node.categoryColor || '#4A90D9';

  const spriteMap = useMemo(() => {
    if (!texture) return null;
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
  }, [texture]);

  if (!texture) return null;

  return (
    <group position={[node.x * 0.1, node.y * 0.1, 0]}>
      {/* Glow sphere behind the avatar */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 0.8, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={isCenter ? 0.15 : 0.08} />
      </mesh>

      {/* Avatar sprite */}
      {spriteMap && (
        <sprite
          ref={meshRef as unknown as React.Ref<THREE.Sprite>}
          material={spriteMap}
          scale={[nodeSize, nodeSize, 1]}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(node.id); }}
          onPointerLeave={() => onHover(null)}
          onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
        />
      )}

      {/* Favorite badge */}
      {node.isFavorite && !isCenter && (
        <mesh position={[nodeSize * 0.35, nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}

      {/* Platform badge */}
      {node.isOnPlatform && !isCenter && (
        <mesh position={[-nodeSize * 0.35, nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Add hint badge for read-only */}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <mesh position={[nodeSize * 0.35, -nodeSize * 0.35, 0.5]}>
          <sphereGeometry args={[0.7, 8, 8]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Name label on hover */}
      {(isHovered || isCenter) && (
        <Html
          center
          position={[0, -nodeSize * 0.7, 0]}
          style={{
            color: 'white',
            fontSize: isCenter ? '14px' : '12px',
            fontWeight: isCenter ? 600 : 500,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {node.label}
          {node.isReadOnly && node.shareableInfo && (
            <span style={{ color: '#4A90D9', fontSize: '10px', marginLeft: 4 }}>(tap to add)</span>
          )}
        </Html>
      )}
    </group>
  );
}

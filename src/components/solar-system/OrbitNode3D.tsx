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

  // Smaller nodes, more breathing room
  const depthScale = isCenter ? 1 : Math.max(0.8, 1 - node.ring * 0.04);
  const baseSize = isCenter ? SOLAR.CENTER_SIZE * 0.10 : SOLAR.NODE_SIZE * 0.08;
  const nodeSize = baseSize * depthScale;

  const glowColor = useMemo(
    () => new THREE.Color(isCenter ? '#F39C12' : node.categoryColor || '#4A90D9'),
    [isCenter, node.categoryColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Barely perceptible float
      groupRef.current.position.z = Math.sin(t * 0.3 + node.angle * 3) * 0.3;
      // Smooth hover scale
      const target = isHovered && !isCenter ? 1.15 : 1;
      const s = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(s + (target - s) * 0.08);
    }

    // Tight glow — only visible on hover or center
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      if (isCenter) {
        mat.opacity = 0.05 + Math.sin(t * 0.8) * 0.02;
      } else {
        mat.opacity = isHovered ? 0.06 : 0.02;
      }
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
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
  const badgeSize = 0.25;
  const badgeOffset = nodeSize * 0.38;

  return (
    <group ref={groupRef} position={pos}>
      {/* Tight glow — 1.1x, not 1.8x */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 1.1, 24, 24]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>

      {/* Thin category ring */}
      {node.categoryColor && !isCenter && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[nodeSize * 0.58, 0.04, 8, 48]} />
          <meshBasicMaterial color={node.categoryColor} transparent opacity={0.4} />
        </mesh>
      )}

      {/* Center — single thin ring, no massive aura */}
      {isCenter && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[nodeSize * 0.7, 0.04, 8, 48]} />
          <meshBasicMaterial color="#F39C12" transparent opacity={0.35} />
        </mesh>
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

      {/* Badges — small, proportional */}
      {node.isFavorite && !isCenter && (
        <mesh position={[badgeOffset, badgeOffset, 0.3]}>
          <sphereGeometry args={[badgeSize, 10, 10]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}
      {node.isOnPlatform && !isCenter && (
        <mesh position={[-badgeOffset, badgeOffset, 0.3]}>
          <sphereGeometry args={[badgeSize, 10, 10]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <mesh position={[badgeOffset, -badgeOffset, 0.3]}>
          <sphereGeometry args={[badgeSize, 10, 10]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}

      {/* Name label */}
      {(isHovered || isCenter) && (
        <Html
          center
          position={[0, -nodeSize * 0.6, 0]}
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

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { OrbitNode3D } from './OrbitNode3D';
import { OrbitRing3D } from './OrbitRing3D';
import { ConnectionLine3D } from './ConnectionLine3D';
import type { OrbitLayout } from '../../utils/orbitCalculator';

interface Galaxy3DProps {
  layout: OrbitLayout;
  hoveredNodeId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

function DustField() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 250;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    sizes[i] = Math.random() * 0.2 + 0.05;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#5DADE2"
        size={0.1}
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({ layout, hoveredNodeId, onHover, onClick }: Galaxy3DProps) {
  const nodePositions = new Map<string, { x: number; y: number }>();
  nodePositions.set(layout.center.id, { x: layout.center.x, y: layout.center.y });
  for (const n of layout.nodes) {
    nodePositions.set(n.id, { x: n.x, y: n.y });
  }

  return (
    <>
      {/* Lighting — warm center + cool fill + ambient */}
      <ambientLight intensity={0.4} color="#8899bb" />
      <pointLight position={[0, 0, 25]} intensity={1.2} color="#F39C12" distance={80} decay={2} />
      <pointLight position={[20, -15, 12]} intensity={0.3} color="#5DADE2" distance={50} decay={2} />
      <directionalLight position={[0, 0, 30]} intensity={0.3} color="#ffffff" />

      {/* Stars */}
      <Stars radius={300} depth={100} count={3000} factor={3} saturation={0.2} fade speed={0.2} />

      <DustField />

      {/* Galactic disc plane — faint elliptical glow beneath everything */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial
          color="#1a1a3e"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <fog attach="fog" args={['#060612', 60, 180]} />

      {layout.rings.map((ring) => (
        <OrbitRing3D key={ring.ring} ring={ring} />
      ))}

      {layout.connections.map((conn) => {
        const from = nodePositions.get(conn.fromId);
        const to = nodePositions.get(conn.toId);
        if (!from || !to) return null;
        return (
          <ConnectionLine3D
            key={`${conn.fromId}-${conn.toId}`}
            from={from}
            to={to}
            type={conn.type}
            isHighlighted={hoveredNodeId === conn.fromId || hoveredNodeId === conn.toId}
          />
        );
      })}

      {layout.nodes.map((node) => (
        <OrbitNode3D
          key={node.id}
          node={node}
          isCenter={false}
          isHovered={hoveredNodeId === node.id}
          onHover={onHover}
          onClick={onClick}
        />
      ))}

      <OrbitNode3D
        node={layout.center}
        isCenter
        isHovered={hoveredNodeId === layout.center.id}
        onHover={onHover}
        onClick={onClick}
      />

      {/* Subtle post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.3}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.4} />
      </EffectComposer>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={12}
        maxDistance={120}
        maxPolarAngle={Math.PI * 0.72}
        minPolarAngle={Math.PI * 0.28}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.35}
        enableDamping
        dampingFactor={0.04}
      />
    </>
  );
}

export function Galaxy3D(props: Galaxy3DProps) {
  return (
    <Canvas
      camera={{ position: [0, -20, 40], fov: 55, near: 0.1, far: 500 }}
      style={{ background: '#060612' }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

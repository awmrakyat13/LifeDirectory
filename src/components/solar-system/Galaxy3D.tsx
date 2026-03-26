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

// Slow ambient dust particles
function DustField() {
  const ref = useRef<THREE.Points>(null);
  const count = 600;

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i] = Math.random() * 0.3 + 0.1;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.02;
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
        size={0.15}
        transparent
        opacity={0.3}
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
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#8899bb" />
      <pointLight position={[0, 0, 25]} intensity={2} color="#F39C12" distance={80} decay={2} />
      <pointLight position={[30, -20, 15]} intensity={0.5} color="#5DADE2" distance={60} decay={2} />
      <pointLight position={[-25, 15, 10]} intensity={0.3} color="#9B59B6" distance={50} decay={2} />

      {/* Deep star field */}
      <Stars radius={300} depth={100} count={5000} factor={5} saturation={0.3} fade speed={0.3} />

      {/* Dust particles */}
      <DustField />

      {/* Fog */}
      <fog attach="fog" args={['#060612', 60, 200]} />

      {/* Orbit rings */}
      {layout.rings.map((ring) => (
        <OrbitRing3D key={ring.ring} ring={ring} />
      ))}

      {/* Connection lines */}
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

      {/* Orbit nodes */}
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

      {/* Center node */}
      <OrbitNode3D
        node={layout.center}
        isCenter
        isHovered={hoveredNodeId === layout.center.id}
        onHover={onHover}
        onClick={onClick}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
        />
      </EffectComposer>

      {/* Camera controls */}
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
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

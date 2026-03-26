import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
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

function Scene({ layout, hoveredNodeId, onHover, onClick }: Galaxy3DProps) {
  const nodePositions = new Map<string, { x: number; y: number }>();
  nodePositions.set(layout.center.id, { x: layout.center.x, y: layout.center.y });
  for (const n of layout.nodes) {
    nodePositions.set(n.id, { x: n.x, y: n.y });
  }

  return (
    <>
      {/* Ambient + point light for subtle shading */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 30]} intensity={1} color="#F39C12" />

      {/* Star field */}
      <Stars radius={200} depth={80} count={3000} factor={4} saturation={0.2} fade speed={0.5} />

      {/* Nebula-like fog */}
      <fog attach="fog" args={['#0a0a1a', 80, 250]} />

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
          scale3d={1}
        />
      ))}

      {/* Center node */}
      <OrbitNode3D
        node={layout.center}
        isCenter
        isHovered={hoveredNodeId === layout.center.id}
        onHover={onHover}
        onClick={onClick}
        scale3d={1}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={15}
        maxDistance={150}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        zoomSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export function Galaxy3D(props: Galaxy3DProps) {
  return (
    <Canvas
      camera={{ position: [0, -25, 45], fov: 60, near: 0.1, far: 500 }}
      style={{ background: '#0a0a1a' }}
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

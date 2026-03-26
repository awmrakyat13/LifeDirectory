import { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import { OrbitNode3D } from './OrbitNode3D';
import { OrbitRing3D } from './OrbitRing3D';
import { ConnectionLine3D } from './ConnectionLine3D';
import type { OrbitLayout } from '../../utils/orbitCalculator';

export interface Galaxy3DRef {
  jumpToRing: (radius: number) => void;
  resetCamera: () => void;
}

interface Galaxy3DProps {
  layout: OrbitLayout;
  hoveredNodeId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onReady?: (ref: Galaxy3DRef) => void;
}

// Slow-drifting dust with multiple color layers
function DustField() {
  const ref1 = useRef<THREE.Points>(null);
  const ref2 = useRef<THREE.Points>(null);

  const [pos1, pos2] = useMemo(() => {
    const p1 = new Float32Array(250 * 3);
    const p2 = new Float32Array(150 * 3);
    for (let i = 0; i < 250; i++) {
      p1[i * 3] = (Math.random() - 0.5) * 300;
      p1[i * 3 + 1] = (Math.random() - 0.5) * 300;
      p1[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    for (let i = 0; i < 150; i++) {
      p2[i * 3] = (Math.random() - 0.5) * 200;
      p2[i * 3 + 1] = (Math.random() - 0.5) * 200;
      p2[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return [p1, p2];
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      ref1.current.rotation.z = t * 0.002;
      ref1.current.rotation.x = Math.sin(t * 0.008) * 0.015;
    }
    if (ref2.current) {
      ref2.current.rotation.z = -t * 0.0015;
      ref2.current.rotation.y = Math.cos(t * 0.006) * 0.01;
    }
  });

  return (
    <>
      <points ref={ref1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos1, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#5DADE2" size={0.08} transparent opacity={0.12} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={ref2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos2, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#9B59B6" size={0.1} transparent opacity={0.08} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

// Slow-rotating nebula glow planes
function NebulaPlanes() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.001;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -4]}>
        <circleGeometry args={[80, 32]} />
        <meshBasicMaterial color="#0d0d2b" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[15, -10, -3.5]} rotation={[0, 0, 0.8]}>
        <circleGeometry args={[45, 32]} />
        <meshBasicMaterial color="#1a0a30" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[-20, 8, -3]} rotation={[0, 0, -0.4]}>
        <circleGeometry args={[35, 32]} />
        <meshBasicMaterial color="#0a1530" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Ambient light that gently shifts color
function ShiftingLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.elapsedTime;
      const r = 0.95 + Math.sin(t * 0.3) * 0.05;
      const g = 0.7 + Math.sin(t * 0.2 + 1) * 0.1;
      const b = 0.4 + Math.sin(t * 0.15 + 2) * 0.1;
      lightRef.current.color.setRGB(r, g, b);
    }
  });
  return <pointLight ref={lightRef} position={[0, 0, 25]} intensity={1.0} distance={80} decay={2} />;
}

function getDefaultCameraPos(): [number, number, number] {
  const isMobile = window.innerWidth < 768;
  return isMobile ? [0, -35, 70] : [0, -20, 40];
}

function CameraController({ onReady }: { onReady?: (ref: Galaxy3DRef) => void }) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsType>(null);

  useEffect(() => {
    const pos = getDefaultCameraPos();
    camera.position.set(pos[0], pos[1], pos[2]);
  }, [camera]);

  useEffect(() => {
    if (onReady) {
      onReady({
        jumpToRing: (radius: number) => {
          const scaledR = radius * 0.1;
          const isMobile = window.innerWidth < 768;
          const dist = scaledR + (isMobile ? 35 : 20);
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
          }
          camera.position.set(0, -dist * 0.4, dist * 0.8);
          camera.lookAt(0, 0, 0);
        },
        resetCamera: () => {
          const pos = getDefaultCameraPos();
          camera.position.set(pos[0], pos[1], pos[2]);
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
          }
        },
      });
    }
  }, [onReady, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      minDistance={12}
      maxDistance={120}
      maxPolarAngle={Math.PI * 0.72}
      minPolarAngle={Math.PI * 0.28}
      zoomSpeed={0.6}
      panSpeed={0.8}
      rotateSpeed={0.35}
      enableDamping
      dampingFactor={0.04}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      touches={{
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
    />
  );
}

function Scene({ layout, hoveredNodeId, onHover, onClick, onReady }: Galaxy3DProps) {
  const nodePositions = new Map<string, { x: number; y: number }>();
  nodePositions.set(layout.center.id, { x: layout.center.x, y: layout.center.y });
  for (const n of layout.nodes) {
    nodePositions.set(n.id, { x: n.x, y: n.y });
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#8899bb" />
      <ShiftingLight />
      <pointLight position={[25, -18, 15]} intensity={0.2} color="#5DADE2" distance={60} decay={2} />
      <directionalLight position={[0, 0, 30]} intensity={0.2} color="#ffffff" />

      {/* Deep star field — two layers for parallax depth */}
      <Stars radius={400} depth={120} count={2500} factor={3} saturation={0.15} fade speed={0.15} />
      <Stars radius={200} depth={60} count={800} factor={5} saturation={0.4} fade speed={0.3} />

      {/* Atmospheric particles */}
      <DustField />

      {/* Nebula background */}
      <NebulaPlanes />

      {/* Fog for depth */}
      <fog attach="fog" args={['#050510', 70, 200]} />

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

      <CameraController onReady={onReady} />
    </>
  );
}

export function Galaxy3D(props: Galaxy3DProps & { onReady?: (ref: Galaxy3DRef) => void }) {
  return (
    <Canvas
      camera={{ position: [0, -30, 55], fov: 55, near: 0.1, far: 500 }}
      style={{ background: '#050510' }}
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

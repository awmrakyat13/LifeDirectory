import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { computeOrbitLayout } from '../../utils/orbitCalculator';
import { useSvgViewBox } from '../../hooks/useSvgViewBox';
import { OrbitRing } from './OrbitRing';
import { OrbitNode } from './OrbitNode';
import { ConnectionLine } from './ConnectionLine';
import { Breadcrumbs } from './Breadcrumbs';
import { ProfileSetupModal } from './ProfileSetupModal';
import styles from './SolarSystemView.module.css';

export function SolarSystemView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  // Data
  const people = useLiveQuery(() => db.people.toArray(), [], []);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], []);
  const personCategories = useLiveQuery(() => db.personCategories.toArray(), [], []);
  const settings = useLiveQuery(() => db.settings.get('singleton'));

  // Drill-down state
  const [centerStack, setCenterStack] = useState<Array<'me' | string>>(['me']);
  const currentCenterId = centerStack[centerStack.length - 1];

  // Hover
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Profile setup
  const [setupDismissed, setSetupDismissed] = useState(false);
  const needsSetup = settings !== undefined && !settings?.myName && !setupDismissed;

  // Zoom/pan
  const { viewBox, svgProps, resetView } = useSvgViewBox(svgRef);

  // Compute layout
  const layout = useMemo(
    () =>
      computeOrbitLayout({
        people,
        categories,
        personCategories,
        centerPersonId: currentCenterId,
        myName: settings?.myName,
        myPhotoBlob: settings?.myPhotoBlob,
      }),
    [people, categories, personCategories, currentCenterId, settings?.myName, settings?.myPhotoBlob]
  );

  // Node position lookup for connection lines
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    map.set(layout.center.id, { x: layout.center.x, y: layout.center.y });
    for (const n of layout.nodes) {
      map.set(n.id, { x: n.x, y: n.y });
    }
    return map;
  }, [layout]);

  // Click handlers
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (nodeId === currentCenterId) {
        if (nodeId !== 'me') navigate(`/people/${nodeId}`);
        return;
      }
      setCenterStack((prev) => [...prev, nodeId]);
      resetView();
    },
    [currentCenterId, navigate, resetView]
  );

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      setCenterStack((prev) => prev.slice(0, index + 1));
      resetView();
    },
    [resetView]
  );

  // Zoom buttons
  const zoom = useCallback(
    (factor: number) => {
      const syntheticEvent = {
        preventDefault: () => {},
        deltaY: factor > 1 ? 1 : -1,
        clientX: (svgRef.current?.getBoundingClientRect().width ?? 0) / 2,
        clientY: (svgRef.current?.getBoundingClientRect().height ?? 0) / 2,
      } as unknown as React.WheelEvent;
      // Apply 3 zoom steps for button clicks
      for (let i = 0; i < 3; i++) svgProps.onWheel(syntheticEvent);
    },
    [svgProps]
  );

  return (
    <div className={styles.container}>
      {centerStack.length > 1 && (
        <Breadcrumbs
          stack={centerStack}
          people={people}
          myName={settings?.myName}
          onNavigate={handleBreadcrumbClick}
        />
      )}

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        {...svgProps}
      >
        {/* Orbit rings */}
        {layout.rings.map((ring) => (
          <OrbitRing key={ring.ring} ring={ring} />
        ))}

        {/* Connection lines */}
        <g className={styles.connectionsLayer}>
          {layout.connections.map((conn) => {
            const from = nodePositions.get(conn.fromId);
            const to = nodePositions.get(conn.toId);
            if (!from || !to) return null;
            return (
              <ConnectionLine
                key={`${conn.fromId}-${conn.toId}`}
                from={from}
                to={to}
                type={conn.type}
                isHighlighted={hoveredNodeId === conn.fromId || hoveredNodeId === conn.toId}
              />
            );
          })}
        </g>

        {/* Orbit nodes */}
        {layout.nodes.map((node) => (
          <OrbitNode
            key={node.id}
            node={node}
            isCenter={false}
            isHovered={hoveredNodeId === node.id}
            onHover={setHoveredNodeId}
            onClick={handleNodeClick}
          />
        ))}

        {/* Center node (always on top) */}
        <OrbitNode
          node={layout.center}
          isCenter
          isHovered={hoveredNodeId === layout.center.id}
          onHover={setHoveredNodeId}
          onClick={handleNodeClick}
        />
      </svg>

      {/* Zoom controls */}
      <div className={styles.zoomHint}>
        <button className={styles.zoomBtn} onClick={() => zoom(0.5)} aria-label="Zoom in">+</button>
        <button className={styles.zoomBtn} onClick={() => zoom(2)} aria-label="Zoom out">&minus;</button>
        <button className={styles.zoomBtn} onClick={resetView} aria-label="Reset view">{'\u2316'}</button>
      </div>

      {people.length === 0 && (
        <div className={styles.emptyHint}>
          Add people to see your solar system come alive
        </div>
      )}

      {needsSetup && <ProfileSetupModal onComplete={() => setSetupDismissed(true)} />}
    </div>
  );
}

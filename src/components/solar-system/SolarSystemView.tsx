import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePeople } from '../../hooks/usePeople';
import { useCategories } from '../../hooks/useCategories';
import { getUserProfile, type UserProfile } from '../../firebase/firestore';
import { subscribePersonCategories } from '../../firebase/firestore';
import { computeOrbitLayout, computeCircleOrbit, type OrbitLayout, type CircleEntry } from '../../utils/orbitCalculator';
import { getCircleSnapshot } from '../../firebase/circleSnapshot';
import { useSvgViewBox } from '../../hooks/useSvgViewBox';
import type { PersonCategory } from '../../models/types';
import { OrbitRing } from './OrbitRing';
import { OrbitNode } from './OrbitNode';
import { ConnectionLine } from './ConnectionLine';
import { Breadcrumbs } from './Breadcrumbs';
import { ProfileSetupModal } from './ProfileSetupModal';
import styles from './SolarSystemView.module.css';

export function SolarSystemView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data from Firestore hooks
  const people = usePeople();
  const { categories } = useCategories();
  const [personCategories, setPersonCategories] = useState<PersonCategory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load person-categories
  useEffect(() => {
    if (!user) return;
    return subscribePersonCategories(user.uid, setPersonCategories);
  }, [user]);

  // Load user profile
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      setProfile(p);
      setProfileLoading(false);
    });
  }, [user]);

  // Drill-down state
  const [centerStack, setCenterStack] = useState<Array<'me' | string>>(['me']);
  const currentCenterId = centerStack[centerStack.length - 1];

  // Hover
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Remote circle (when viewing a platform user's orbit)
  const [remoteCircle, setRemoteCircle] = useState<{ label: string; entries: CircleEntry[] } | null>(null);

  // Load remote circle when drilling into an autolinked person
  useEffect(() => {
    if (currentCenterId !== 'me' && currentCenterId.startsWith('autolinked-')) {
      const remoteUid = currentCenterId.replace('autolinked-', '');
      const person = people.find((p) => p.id === currentCenterId);
      const label = person ? `${person.firstName} ${person.lastName}` : 'Their Circle';
      getCircleSnapshot(remoteUid).then((entries) => {
        setRemoteCircle({ label, entries });
      }).catch(() => setRemoteCircle(null));
    } else {
      setRemoteCircle(null);
    }
  }, [currentCenterId, people]);

  // Profile setup
  const [setupDismissed, setSetupDismissed] = useState(false);
  const needsSetup = !profileLoading && !profile && !setupDismissed;

  // Zoom/pan
  const { viewBox, svgProps, resetView } = useSvgViewBox(svgRef);

  // Compute layout — use remote circle view when viewing a platform user
  const layout: OrbitLayout = useMemo(() => {
    if (remoteCircle && currentCenterId.startsWith('autolinked-')) {
      return computeCircleOrbit(remoteCircle.label, remoteCircle.entries);
    }
    return computeOrbitLayout({
      people,
      categories,
      personCategories,
      centerPersonId: currentCenterId,
      myName: profile?.name,
      myPhotoBlob: undefined,
    });
  }, [people, categories, personCategories, currentCenterId, profile?.name, remoteCircle]);

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
      for (let i = 0; i < 3; i++) svgProps.onWheel(syntheticEvent);
    },
    [svgProps]
  );

  function handleSetupComplete() {
    setSetupDismissed(true);
    // Reload profile
    if (user) getUserProfile(user.uid).then(setProfile);
  }

  return (
    <div className={styles.container}>
      {centerStack.length > 1 && (
        <Breadcrumbs
          stack={centerStack}
          people={people}
          myName={profile?.name}
          onNavigate={handleBreadcrumbClick}
        />
      )}

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        {...svgProps}
      >
        {layout.rings.map((ring) => (
          <OrbitRing key={ring.ring} ring={ring} />
        ))}

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

        <OrbitNode
          node={layout.center}
          isCenter
          isHovered={hoveredNodeId === layout.center.id}
          onHover={setHoveredNodeId}
          onClick={handleNodeClick}
        />
      </svg>

      <div className={styles.zoomHint}>
        <button className={styles.zoomBtn} onClick={() => zoom(0.5)} aria-label="Zoom in">+</button>
        <button className={styles.zoomBtn} onClick={() => zoom(2)} aria-label="Zoom out">&minus;</button>
        <button className={styles.zoomBtn} onClick={resetView} aria-label="Reset view">{'\u2316'}</button>
      </div>

      {people.length === 0 && !needsSetup && (
        <div className={styles.emptyHint}>
          Add people to see your solar system come alive
        </div>
      )}

      {needsSetup && <ProfileSetupModal onComplete={handleSetupComplete} />}
    </div>
  );
}

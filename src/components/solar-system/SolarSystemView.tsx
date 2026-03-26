import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePeople } from '../../hooks/usePeople';
import { useCategories } from '../../hooks/useCategories';
import { getUserProfile, type UserProfile } from '../../firebase/firestore';
import { subscribePersonCategories } from '../../firebase/firestore';
import { computeOrbitLayout, computeCircleOrbit, type OrbitLayout, type CircleEntry, type ShareableInfo } from '../../utils/orbitCalculator';
import { getCircleSnapshot } from '../../firebase/circleSnapshot';
import { usePersonActions } from '../../hooks/usePeople';
import { useToast } from '../ui/Toast';
import { useSvgViewBox } from '../../hooks/useSvgViewBox';
import { Modal } from '../ui/Modal';
import type { PersonCategory } from '../../models/types';
import { OrbitRing } from './OrbitRing';
import { OrbitNode } from './OrbitNode';
import { ConnectionLine } from './ConnectionLine';
import { Breadcrumbs } from './Breadcrumbs';
import { ProfileSetupModal } from './ProfileSetupModal';
import { GalaxyFilters, StarField, NebulaBackground } from './GalaxyEffects';
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

  // Add from circle state
  const { addPerson } = usePersonActions();
  const { toast } = useToast();
  const [addFromCircle, setAddFromCircle] = useState<ShareableInfo | null>(null);

  async function handleAddFromCircle() {
    if (!addFromCircle) return;
    const emails = addFromCircle.email ? [{ label: 'Email', value: addFromCircle.email }] : undefined;
    await addPerson(
      {
        firstName: addFromCircle.firstName,
        lastName: addFromCircle.lastName,
        birthday: addFromCircle.birthday,
        anniversary: addFromCircle.anniversary,
        emails,
        isFavorite: false,
      },
      []
    );
    toast(`${addFromCircle.firstName} ${addFromCircle.lastName} added to your directory`, 'success');
    setAddFromCircle(null);
  }

  // Click handlers
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Handle read-only circle nodes — offer to add
      const node = layout.nodes.find((n) => n.id === nodeId);
      if (node?.isReadOnly && node.shareableInfo) {
        setAddFromCircle(node.shareableInfo);
        return;
      }

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

      <div className={styles.svgWrapper}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        {...svgProps}
      >
        <GalaxyFilters />
        <NebulaBackground />
        <StarField />

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
      </div>

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

      {addFromCircle && (
        <Modal title="Add to Your Directory?" onClose={() => setAddFromCircle(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Add <strong>{addFromCircle.firstName} {addFromCircle.lastName}</strong> to your directory with the following info:
            </p>
            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
              <div><strong>Name:</strong> {addFromCircle.firstName} {addFromCircle.lastName}</div>
              {addFromCircle.birthday && <div><strong>Birthday:</strong> {addFromCircle.birthday}</div>}
              {addFromCircle.anniversary && <div><strong>Anniversary:</strong> {addFromCircle.anniversary}</div>}
              {addFromCircle.email && <div><strong>Email:</strong> {addFromCircle.email}</div>}
            </div>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
              You can add your own notes, categories, and details after adding.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAddFromCircle(null)}
                style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddFromCircle}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Add to Directory
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

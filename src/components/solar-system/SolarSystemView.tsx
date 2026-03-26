import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { Modal } from '../ui/Modal';
import type { PersonCategory } from '../../models/types';
import { Galaxy3D, type Galaxy3DRef } from './Galaxy3D';
import { Breadcrumbs } from './Breadcrumbs';
import { ProfileSetupModal } from './ProfileSetupModal';
import styles from './SolarSystemView.module.css';

export function SolarSystemView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const galaxyRef = useRef<Galaxy3DRef | null>(null);

  // Data from Firestore hooks
  const people = usePeople();
  const { categories } = useCategories();
  const [personCategories, setPersonCategories] = useState<PersonCategory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return subscribePersonCategories(user.uid, setPersonCategories);
  }, [user]);

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

  // Remote circle
  const [remoteCircle, setRemoteCircle] = useState<{ label: string; entries: CircleEntry[] } | null>(null);

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

  // Ring focus
  const [focusedRing, setFocusedRing] = useState<string | undefined>();

  // Base layout (for ring list in selector)
  const baseLayout: OrbitLayout = useMemo(() => {
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

  // Apply ring focus if selected
  const layout: OrbitLayout = useMemo(() => {
    if (!focusedRing) return baseLayout;
    return computeOrbitLayout({
      people,
      categories,
      personCategories,
      centerPersonId: currentCenterId,
      myName: profile?.name,
      myPhotoBlob: undefined,
      focusedRingLabel: focusedRing,
    });
  }, [baseLayout, focusedRing, people, categories, personCategories, currentCenterId, profile?.name]);

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
    },
    [currentCenterId, navigate, layout.nodes]
  );

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      setCenterStack((prev) => prev.slice(0, index + 1));
    },
    []
  );

  function handleSetupComplete() {
    setSetupDismissed(true);
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

      <Galaxy3D
        layout={layout}
        hoveredNodeId={hoveredNodeId}
        onHover={setHoveredNodeId}
        onClick={handleNodeClick}
        onReady={(ref) => { galaxyRef.current = ref; }}
      />

      {/* Ring selector bar */}
      {baseLayout.rings.length > 0 && (
        <div className={styles.ringBar}>
          <button
            className={`${styles.ringPill} ${!focusedRing ? styles.ringPillActive : ''}`}
            onClick={() => { setFocusedRing(undefined); galaxyRef.current?.resetCamera(); }}
          >
            All
          </button>
          {baseLayout.rings.map((ring) => (
            <button
              key={ring.ring}
              className={`${styles.ringPill} ${focusedRing === ring.label ? styles.ringPillActive : ''}`}
              onClick={() => {
                setFocusedRing(focusedRing === ring.label ? undefined : ring.label);
                galaxyRef.current?.resetCamera();
              }}
              style={focusedRing === ring.label
                ? { background: ring.color, borderColor: ring.color, color: 'white' }
                : { borderColor: ring.color, color: ring.color }
              }
            >
              {ring.label}
            </button>
          ))}
        </div>
      )}

      {people.length === 0 && !needsSetup && (
        <div className={styles.emptyHint}>
          Add people to see your galaxy come alive
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

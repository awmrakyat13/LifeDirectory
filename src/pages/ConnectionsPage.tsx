import { useState } from 'react';
import { useConnections } from '../hooks/useConnections';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import type { PublicProfile } from '../firebase/firestore';
import styles from './ConnectionsPage.module.css';

export function ConnectionsPage() {
  const { incoming, outgoing, connections, searchByEmail, sendRequest, acceptRequest, declineRequest } = useConnections();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<PublicProfile | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSearch() {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchDone(false);
    setSearchResult(null);
    const result = await searchByEmail(searchEmail.trim().toLowerCase());
    setSearchResult(result);
    setSearchDone(true);
    setSearching(false);
  }

  async function handleSendRequest() {
    if (!searchResult) return;
    setSending(true);
    await sendRequest(searchResult);
    toast(`Connection request sent to ${searchResult.name}`, 'success');
    setSending(false);
    setShowAddModal(false);
    setSearchEmail('');
    setSearchResult(null);
    setSearchDone(false);
  }

  async function handleAccept(req: typeof incoming[0]) {
    await acceptRequest(req);
    toast(`Connected with ${req.fromName}!`, 'success');
  }

  async function handleDecline(req: typeof incoming[0]) {
    await declineRequest(req.id);
    toast('Request declined', 'info');
  }

  const alreadyRequested = new Set(outgoing.map((r) => r.toEmail));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Connections</h1>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Add by Email
        </button>
      </div>

      {incoming.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Incoming Requests <span className={styles.badge}>{incoming.length}</span>
          </h2>
          <div className={styles.list}>
            {incoming.map((req) => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <div className={styles.requestName}>{req.fromName}</div>
                  <div className={styles.requestEmail}>{req.fromEmail}</div>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.acceptBtn} onClick={() => handleAccept(req)}>
                    Accept
                  </button>
                  <button className={styles.declineBtn} onClick={() => handleDecline(req)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sent Requests</h2>
          <div className={styles.list}>
            {outgoing.map((req) => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <div className={styles.requestName}>{req.toName}</div>
                  <div className={styles.requestEmail}>{req.toEmail}</div>
                </div>
                <div className={styles.requestStatus}>
                  {req.status === 'pending' ? 'Pending' : req.status === 'accepted' ? 'Accepted' : 'Declined'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Connected ({connections.length})</h2>
        {connections.length === 0 ? (
          <p className={styles.empty}>
            No connections yet. Add someone by email to get started.
          </p>
        ) : (
          <div className={styles.list}>
            {connections.map((conn) => (
              <div key={conn.id} className={styles.connectionCard}>
                <div className={styles.requestInfo}>
                  <div className={styles.requestName}>
                    {conn.uid1} / {conn.uid2}
                  </div>
                  <div className={styles.requestEmail}>
                    Connected {new Date(conn.connectedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.connectedLabel}>Connected</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showAddModal && (
        <Modal title="Add Connection" onClose={() => { setShowAddModal(false); setSearchEmail(''); setSearchResult(null); setSearchDone(false); }}>
          <div className={styles.searchForm}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Enter the email address of someone on Life Directory
            </label>
            <input
              className={styles.searchInput}
              type="email"
              value={searchEmail}
              onChange={(e) => { setSearchEmail(e.target.value); setSearchDone(false); setSearchResult(null); }}
              placeholder="friend@example.com"
              autoFocus
            />
            <button
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={!searchEmail.trim() || searching}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>

            {searchDone && !searchResult && (
              <p className={styles.searchError}>
                No user found with that email. They may not have signed up yet.
              </p>
            )}

            {searchResult && (
              <div className={styles.searchResult}>
                <div className={styles.searchResultInfo}>
                  <div className={styles.searchResultName}>{searchResult.name}</div>
                  <div className={styles.searchResultEmail}>{searchResult.email}</div>
                </div>
                {alreadyRequested.has(searchResult.email) ? (
                  <span className={styles.requestStatus}>Already requested</span>
                ) : (
                  <button
                    className={styles.sendBtn}
                    onClick={handleSendRequest}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Request'}
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

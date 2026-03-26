import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { usePersonActions } from '../../hooks/usePeople';
import { useToast } from '../ui/Toast';
import styles from './ContactImport.module.css';

interface PickedContact {
  name: string[];
  email?: string[];
  tel?: string[];
}

function isContactPickerSupported(): boolean {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

export function ContactImportButton() {
  const [contacts, setContacts] = useState<PickedContact[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const { addPerson } = usePersonActions();
  const { toast } = useToast();

  async function handlePick() {
    if (!isContactPickerSupported()) {
      toast('Contact import not supported on this device/browser', 'error');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const results = await nav.contacts.select(
        ['name', 'email', 'tel'],
        { multiple: true }
      ) as PickedContact[];
      if (results.length > 0) {
        setContacts(results);
        setSelected(new Set(results.map((_, i) => i)));
        setShowModal(true);
      }
    } catch {
      toast('Contact import cancelled', 'info');
    }
  }

  function toggleContact(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleImport() {
    let count = 0;
    for (const i of selected) {
      const contact = contacts[i];
      const fullName = contact.name?.[0] || 'Unknown';
      const parts = fullName.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';
      const emails = contact.email?.map((e, idx) => ({ label: idx === 0 ? 'Personal' : 'Other', value: e }));
      const phones = contact.tel?.map((t, idx) => ({ label: idx === 0 ? 'Mobile' : 'Other', value: t }));

      await addPerson(
        { firstName, lastName, emails, phones, isFavorite: false },
        []
      );
      count++;
    }
    toast(`Imported ${count} ${count === 1 ? 'contact' : 'contacts'}`, 'success');
    setShowModal(false);
    setContacts([]);
    setSelected(new Set());
  }

  if (!isContactPickerSupported()) {
    return <span className={styles.notSupported}>Contact import not available on this browser</span>;
  }

  return (
    <>
      <button className={styles.btn} onClick={handlePick}>
        Import from Contacts
      </button>

      {showModal && (
        <Modal title={`Import ${selected.size} of ${contacts.length} Contacts`} onClose={() => setShowModal(false)}>
          <div className={styles.list}>
            {contacts.map((contact, i) => (
              <label key={i} className={styles.contactItem}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selected.has(i)}
                  onChange={() => toggleContact(i)}
                />
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>{contact.name?.[0] || 'Unknown'}</div>
                  <div className={styles.contactMeta}>
                    {contact.email?.[0] || ''}{contact.email?.[0] && contact.tel?.[0] ? ' · ' : ''}{contact.tel?.[0] || ''}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button className={styles.importBtn} onClick={handleImport} disabled={selected.size === 0}>
              Import {selected.size}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

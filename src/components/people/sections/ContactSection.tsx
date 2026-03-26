import type { ContactEntry, SocialMediaEntry } from '../../../models/types';
import styles from '../PersonForm.module.css';

interface ContactSectionProps {
  phones: ContactEntry[];
  setPhones: (val: ContactEntry[]) => void;
  emails: ContactEntry[];
  setEmails: (val: ContactEntry[]) => void;
  socialMedia: SocialMediaEntry[];
  setSocialMedia: (val: SocialMediaEntry[]) => void;
  address: string;
  setAddress: (val: string) => void;
}

export function ContactSection({
  phones,
  setPhones,
  emails,
  setEmails,
  socialMedia,
  setSocialMedia,
  address,
  setAddress,
}: ContactSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Contact</h2>
      <div className={styles.fieldGroup}>
        <div className={styles.arrayField}>
          <label className={styles.label}>Phone Numbers</label>
          {phones.map((p, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Label" value={p.label} onChange={(e) => {
                const next = [...phones];
                next[i] = { ...p, label: e.target.value };
                setPhones(next);
              }} style={{ maxWidth: 120 }} />
              <input className={styles.input} placeholder="Number" value={p.value} onChange={(e) => {
                const next = [...phones];
                next[i] = { ...p, value: e.target.value };
                setPhones(next);
              }} />
              <button type="button" className={styles.removeBtn} onClick={() => setPhones(phones.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setPhones([...phones, { label: 'Mobile', value: '' }])}>+ Add Phone</button>
        </div>

        <div className={styles.arrayField}>
          <label className={styles.label}>Email Addresses</label>
          {emails.map((e, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Label" value={e.label} onChange={(ev) => {
                const next = [...emails];
                next[i] = { ...e, label: ev.target.value };
                setEmails(next);
              }} style={{ maxWidth: 120 }} />
              <input className={styles.input} type="email" placeholder="Email" value={e.value} onChange={(ev) => {
                const next = [...emails];
                next[i] = { ...e, value: ev.target.value };
                setEmails(next);
              }} />
              <button type="button" className={styles.removeBtn} onClick={() => setEmails(emails.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setEmails([...emails, { label: 'Personal', value: '' }])}>+ Add Email</button>
        </div>

        <div className={styles.arrayField}>
          <label className={styles.label}>Social Media</label>
          {socialMedia.map((s, i) => (
            <div key={i} className={styles.arrayItem}>
              <input className={styles.input} placeholder="Platform" value={s.platform} onChange={(e) => {
                const next = [...socialMedia];
                next[i] = { ...s, platform: e.target.value };
                setSocialMedia(next);
              }} style={{ maxWidth: 120 }} />
              <input className={styles.input} placeholder="Handle / URL" value={s.handle} onChange={(e) => {
                const next = [...socialMedia];
                next[i] = { ...s, handle: e.target.value };
                setSocialMedia(next);
              }} />
              <button type="button" className={styles.removeBtn} onClick={() => setSocialMedia(socialMedia.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
          <button type="button" className={styles.addItemBtn} onClick={() => setSocialMedia([...socialMedia, { platform: '', handle: '' }])}>+ Add Social</button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <textarea className={styles.textarea} value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
        </div>
      </div>
    </div>
  );
}

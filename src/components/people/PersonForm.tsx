import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { usePersonActions } from '../../hooks/usePeople';
import { useToast } from '../ui/Toast';
import { compressImage } from '../../utils/image';
import type { Person, Child, Pet, ContactEntry, SocialMediaEntry, NamedDate, KnownThrough } from '../../models/types';
import styles from './PersonForm.module.css';

import { IdentitySection } from './sections/IdentitySection';
import { CategoriesSection } from './sections/CategoriesSection';
import { KeyDatesSection } from './sections/KeyDatesSection';
import { FamilySection } from './sections/FamilySection';
import { WorkLifeSection } from './sections/WorkLifeSection';
import { ContactSection } from './sections/ContactSection';
import { MemorySection } from './sections/MemorySection';
import { LinkedPeopleSection } from './sections/LinkedPeopleSection';
import { KnownThroughSection } from './sections/KnownThroughSection';

interface PersonFormProps {
  initialData?: Person;
  initialCategoryIds?: string[];
}

export function PersonForm({ initialData, initialCategoryIds }: PersonFormProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { addPerson, updatePerson } = usePersonActions();
  const { toast } = useToast();
  const isEditing = !!initialData;

  const [firstName, setFirstName] = useState(initialData?.firstName ?? '');
  const [lastName, setLastName] = useState(initialData?.lastName ?? '');
  const [nickname, setNickname] = useState(initialData?.nickname ?? '');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(initialData?.photoBlob);
  const [relationshipLabel, setRelationshipLabel] = useState(initialData?.relationshipLabel ?? '');
  const [howWeMet, setHowWeMet] = useState(initialData?.howWeMet ?? '');

  const [birthday, setBirthday] = useState(initialData?.birthday ?? '');
  const [anniversary, setAnniversary] = useState(initialData?.anniversary ?? '');
  const [customDates, setCustomDates] = useState<NamedDate[]>(initialData?.customDates ?? []);

  const [spousePartner, setSpousePartner] = useState(initialData?.spousePartner ?? '');
  const [children, setChildren] = useState<Child[]>(initialData?.children ?? []);
  const [pets, setPets] = useState<Pet[]>(initialData?.pets ?? []);

  const [occupation, setOccupation] = useState(initialData?.occupation ?? '');
  const [company, setCompany] = useState(initialData?.company ?? '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests ?? []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions ?? []);
  const [languages, setLanguages] = useState<string[]>(initialData?.languages ?? []);

  const [phones, setPhones] = useState<ContactEntry[]>(initialData?.phones ?? []);
  const [emails, setEmails] = useState<ContactEntry[]>(initialData?.emails ?? []);
  const [socialMedia, setSocialMedia] = useState<SocialMediaEntry[]>(initialData?.socialMedia ?? []);
  const [address, setAddress] = useState(initialData?.address ?? '');

  const [lifeUpdates, setLifeUpdates] = useState(initialData?.lifeUpdates ?? '');
  const [topicsToBringUp, setTopicsToBringUp] = useState<string[]>(initialData?.topicsToBringUp ?? []);
  const [giftIdeas, setGiftIdeas] = useState<string[]>(initialData?.giftIdeas ?? []);
  const [sensitiveTopics, setSensitiveTopics] = useState<string[]>(initialData?.sensitiveTopics ?? []);
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds ?? []);
  const [linkedPersonIds, setLinkedPersonIds] = useState<string[]>(initialData?.linkedPersonIds ?? []);
  const [knownThrough, setKnownThrough] = useState<KnownThrough | undefined>(initialData?.knownThrough);
  const [isFavorite] = useState(initialData?.isFavorite ?? false);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPhotoBlob(compressed);
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const personData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname || undefined,
      photoBlob,
      relationshipLabel: relationshipLabel || undefined,
      howWeMet: howWeMet || undefined,
      birthday: birthday || undefined,
      anniversary: anniversary || undefined,
      customDates: customDates.length > 0 ? customDates : undefined,
      spousePartner: spousePartner || undefined,
      children: children.length > 0 ? children : undefined,
      pets: pets.length > 0 ? pets : undefined,
      linkedPersonIds: linkedPersonIds.length > 0 ? linkedPersonIds : undefined,
      knownThrough,
      occupation: occupation || undefined,
      company: company || undefined,
      interests: interests.length > 0 ? interests : undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      languages: languages.length > 0 ? languages : undefined,
      phones: phones.length > 0 ? phones : undefined,
      emails: emails.length > 0 ? emails : undefined,
      socialMedia: socialMedia.length > 0 ? socialMedia : undefined,
      address: address || undefined,
      lastInteractionDate: initialData?.lastInteractionDate,
      lifeUpdates: lifeUpdates || undefined,
      topicsToBringUp: topicsToBringUp.length > 0 ? topicsToBringUp : undefined,
      giftIdeas: giftIdeas.length > 0 ? giftIdeas : undefined,
      sensitiveTopics: sensitiveTopics.length > 0 ? sensitiveTopics : undefined,
      notes: notes || undefined,
      isFavorite,
    };

    if (isEditing) {
      await updatePerson(initialData.id, personData, selectedCategoryIds);
      toast(`${firstName} ${lastName} updated`, 'success');
      navigate(`/people/${initialData.id}`);
    } else {
      const id = await addPerson(personData, selectedCategoryIds);
      toast(`${firstName} ${lastName} added`, 'success');
      navigate(`/people/${id}`);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Person' : 'Add Person'}</h1>
      </div>

      <IdentitySection
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        nickname={nickname}
        setNickname={setNickname}
        relationshipLabel={relationshipLabel}
        setRelationshipLabel={setRelationshipLabel}
        howWeMet={howWeMet}
        setHowWeMet={setHowWeMet}
        photoBlob={photoBlob}
        setPhotoBlob={setPhotoBlob}
        onPhotoSelect={handlePhotoSelect}
      />

      <CategoriesSection
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        toggleCategory={toggleCategory}
      />

      <KeyDatesSection
        birthday={birthday}
        setBirthday={setBirthday}
        anniversary={anniversary}
        setAnniversary={setAnniversary}
        customDates={customDates}
        setCustomDates={setCustomDates}
      />

      <FamilySection
        spousePartner={spousePartner}
        setSpousePartner={setSpousePartner}
        children={children}
        setChildren={setChildren}
        pets={pets}
        setPets={setPets}
      />

      <WorkLifeSection
        occupation={occupation}
        setOccupation={setOccupation}
        company={company}
        setCompany={setCompany}
        interests={interests}
        setInterests={setInterests}
        dietaryRestrictions={dietaryRestrictions}
        setDietaryRestrictions={setDietaryRestrictions}
        languages={languages}
        setLanguages={setLanguages}
      />

      <ContactSection
        phones={phones}
        setPhones={setPhones}
        emails={emails}
        setEmails={setEmails}
        socialMedia={socialMedia}
        setSocialMedia={setSocialMedia}
        address={address}
        setAddress={setAddress}
      />

      <KnownThroughSection
        knownThrough={knownThrough}
        setKnownThrough={setKnownThrough}
        currentPersonId={initialData?.id}
      />

      <LinkedPeopleSection
        linkedPersonIds={linkedPersonIds}
        setLinkedPersonIds={setLinkedPersonIds}
        currentPersonId={initialData?.id}
      />

      <MemorySection
        lifeUpdates={lifeUpdates}
        setLifeUpdates={setLifeUpdates}
        topicsToBringUp={topicsToBringUp}
        setTopicsToBringUp={setTopicsToBringUp}
        giftIdeas={giftIdeas}
        setGiftIdeas={setGiftIdeas}
        sensitiveTopics={sensitiveTopics}
        setSensitiveTopics={setSensitiveTopics}
        notes={notes}
        setNotes={setNotes}
      />

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={!firstName.trim() || !lastName.trim()}>
          {isEditing ? 'Save Changes' : 'Add Person'}
        </button>
      </div>
    </form>
  );
}

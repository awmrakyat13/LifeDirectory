import { useParams } from 'react-router-dom';
import { usePerson } from '../hooks/usePeople';
import { BriefingCard } from '../components/people/BriefingCard';
import { PersonDetail } from '../components/people/PersonDetail';
import { InteractionLog } from '../components/interactions/InteractionLog';

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { person, categories } = usePerson(id);

  if (!person) {
    return <div>Person not found.</div>;
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <BriefingCard person={person} />
      <PersonDetail person={person} categories={categories} />
      <InteractionLog personId={person.id} />
    </div>
  );
}

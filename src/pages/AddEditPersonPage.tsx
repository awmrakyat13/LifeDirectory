import { useParams } from 'react-router-dom';
import { usePerson } from '../hooks/usePeople';
import { PersonForm } from '../components/people/PersonForm';

export function AddEditPersonPage() {
  const { id } = useParams<{ id: string }>();
  const { person, categories } = usePerson(id);

  if (id && !person) {
    return <div>Loading...</div>;
  }

  return (
    <PersonForm
      key={id ?? 'new'}
      initialData={person ?? undefined}
      initialCategoryIds={categories.map((c) => c.id)}
    />
  );
}

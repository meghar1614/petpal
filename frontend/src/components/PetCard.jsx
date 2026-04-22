import { Link } from 'react-router-dom';

const SPECIES_ICON = {
  dog: '🐕', cat: '🐈', bird: '🦜', fish: '🐠', reptile: '🦎', rabbit: '🐇', other: '🐾',
};

export default function PetCard({ pet, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="row space-between">
        <h3>
          <Link to={`/pets/${pet._id}`}>
            {SPECIES_ICON[pet.species] || '🐾'} {pet.name}
          </Link>
        </h3>
        <span className="badge">{pet.species}</span>
      </div>
      {pet.breed && <div className="meta">Breed: {pet.breed}</div>}
      {pet.birthday && (
        <div className="meta">Born: {new Date(pet.birthday).toLocaleDateString()}</div>
      )}
      {pet.notes && <p style={{ marginTop: 10 }}>{pet.notes}</p>}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-small" onClick={() => onEdit(pet)}>Edit</button>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(pet)}>Delete</button>
      </div>
    </div>
  );
}

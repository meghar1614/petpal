import { useEffect, useState } from 'react';

const SPECIES = ['dog', 'cat', 'bird', 'fish', 'reptile', 'rabbit', 'other'];

const empty = { name: '', species: 'dog', breed: '', birthday: '', notes: '', photoUrl: '' };

export default function PetForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        species: initial.species || 'dog',
        breed: initial.breed || '',
        birthday: initial.birthday ? initial.birthday.slice(0, 10) : '',
        notes: initial.notes || '',
        photoUrl: initial.photoUrl || '',
      });
    } else {
      setForm(empty);
    }
  }, [initial]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        ...form,
        birthday: form.birthday || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h2>{initial ? 'Edit pet' : 'Add a pet'}</h2>
      <div className="form-row">
        <label>Name</label>
        <input required value={form.name} onChange={change('name')} placeholder="Biscuit" />
      </div>
      <div className="form-row">
        <label>Species</label>
        <select value={form.species} onChange={change('species')}>
          {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Breed</label>
        <input value={form.breed} onChange={change('breed')} placeholder="Corgi" />
      </div>
      <div className="form-row">
        <label>Birthday</label>
        <input type="date" value={form.birthday} onChange={change('birthday')} />
      </div>
      <div className="form-row">
        <label>Photo URL</label>
        <input value={form.photoUrl} onChange={change('photoUrl')} placeholder="https://…" />
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea value={form.notes} onChange={change('notes')} />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add pet'}
        </button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

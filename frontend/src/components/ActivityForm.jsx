import { useEffect, useState } from 'react';

const TYPES = ['feeding', 'walk', 'grooming', 'vet', 'medication', 'play', 'other'];

const empty = { type: 'feeding', title: '', notes: '', scheduledFor: '', completed: false };

export default function ActivityForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        type: initial.type || 'feeding',
        title: initial.title || '',
        notes: initial.notes || '',
        scheduledFor: initial.scheduledFor
          ? new Date(initial.scheduledFor).toISOString().slice(0, 16)
          : '',
        completed: !!initial.completed,
      });
    } else {
      setForm(empty);
    }
  }, [initial]);

  const change = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        ...form,
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : undefined,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h2>{initial ? 'Edit activity' : 'Log a care activity'}</h2>
      <div className="form-row">
        <label>Type</label>
        <select value={form.type} onChange={change('type')}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Title</label>
        <input required value={form.title} onChange={change('title')} placeholder="Morning walk" />
      </div>
      <div className="form-row">
        <label>When</label>
        <input type="datetime-local" value={form.scheduledFor} onChange={change('scheduledFor')} />
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea value={form.notes} onChange={change('notes')} />
      </div>
      <div className="form-row">
        <label>
          <input type="checkbox" checked={form.completed} onChange={change('completed')} /> Completed
        </label>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Log activity'}
        </button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

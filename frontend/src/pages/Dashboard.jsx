import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import PetCard from '../components/PetCard';
import PetForm from '../components/PetForm';
import { useSocket } from '../context/SocketContext';

export default function Dashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { subscribe } = useSocket();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pets');
      setPets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates via WebSocket
  useEffect(() => {
    const off = subscribe('pet:updated', (payload) => {
      setPets((prev) => {
        if (payload.deleted) return prev.filter((p) => p._id !== payload._id);
        const idx = prev.findIndex((p) => p._id === payload._id);
        if (idx === -1) return [payload, ...prev];
        const next = [...prev];
        next[idx] = payload;
        return next;
      });
    });
    return off;
  }, [subscribe]);

  const save = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        const { data } = await api.put(`/pets/${editing._id}`, form);
        setPets((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      } else {
        const { data } = await api.post('/pets', form);
        setPets((prev) => [data, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (pet) => {
    if (!window.confirm(`Delete ${pet.name}? This removes related activities too.`)) return;
    await api.delete(`/pets/${pet._id}`);
    setPets((prev) => prev.filter((p) => p._id !== pet._id));
  };

  const startEdit = (pet) => {
    setEditing(pet);
    setShowForm(true);
  };

  return (
    <div className="container">
      <div className="row space-between">
        <h1>Your Pets</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
          }}
        >
          {showForm && !editing ? 'Close' : '+ Add pet'}
        </button>
      </div>

      {showForm && (
        <PetForm
          initial={editing}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          submitting={submitting}
        />
      )}

      {loading ? (
        <div className="loading">Loading pets…</div>
      ) : pets.length === 0 ? (
        <div className="empty">
          No pets yet. Click <strong>+ Add pet</strong> to get started.
        </div>
      ) : (
        <div className="grid">
          {pets.map((p) => (
            <PetCard key={p._id} pet={p} onEdit={startEdit} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

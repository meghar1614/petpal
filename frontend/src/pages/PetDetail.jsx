import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import ActivityForm from '../components/ActivityForm';
import ActivityItem from '../components/ActivityItem';
import { useSocket } from '../context/SocketContext';

export default function PetDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [pet, setPet] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { subscribe } = useSocket();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [petRes, actsRes] = await Promise.all([
        api.get(`/pets/${id}`),
        api.get(`/activities?petId=${id}`),
      ]);
      setPet(petRes.data);
      setActivities(actsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: activities
  useEffect(() => {
    const offActivity = subscribe('activity:created', (payload) => {
      // Only activities belonging to this pet
      if (payload.pet && String(payload.pet) !== String(id)) return;
      if (payload.deleted) {
        setActivities((prev) => prev.filter((a) => a._id !== payload._id));
        return;
      }
      setActivities((prev) => {
        const idx = prev.findIndex((a) => a._id === payload._id);
        if (idx === -1) return [payload, ...prev];
        const next = [...prev];
        next[idx] = payload;
        return next;
      });
    });
    const offPet = subscribe('pet:updated', (payload) => {
      if (String(payload._id) !== String(id)) return;
      if (payload.deleted) nav('/');
      else setPet(payload);
    });
    return () => {
      offActivity();
      offPet();
    };
  }, [id, subscribe, nav]);

  const save = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        const { data } = await api.put(`/activities/${editing._id}`, { ...form, pet: id });
        setActivities((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      } else {
        const { data } = await api.post('/activities', { ...form, pet: id });
        setActivities((prev) => [data, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (activity) => {
    if (!window.confirm('Delete this activity?')) return;
    await api.delete(`/activities/${activity._id}`);
    setActivities((prev) => prev.filter((a) => a._id !== activity._id));
  };

  const toggle = async (activity) => {
    const { data } = await api.put(`/activities/${activity._id}`, {
      completed: !activity.completed,
    });
    setActivities((prev) => prev.map((a) => (a._id === data._id ? data : a)));
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!pet) return <div className="container"><div className="empty">Pet not found.</div></div>;

  return (
    <div className="container">
      <div><Link to="/">← Back to dashboard</Link></div>
      <div className="row space-between" style={{ marginTop: 12 }}>
        <h1>{pet.name}</h1>
        <span className="badge">{pet.species}</span>
      </div>
      {pet.breed && <div className="muted">Breed: {pet.breed}</div>}
      {pet.notes && <p>{pet.notes}</p>}

      <div className="row space-between" style={{ marginTop: 24 }}>
        <h2>Care activities</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
          }}
        >
          {showForm && !editing ? 'Close' : '+ Log activity'}
        </button>
      </div>

      {showForm && (
        <ActivityForm
          initial={editing}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          submitting={submitting}
        />
      )}

      {activities.length === 0 ? (
        <div className="empty">No activities yet.</div>
      ) : (
        <div className="grid">
          {activities.map((a) => (
            <ActivityItem
              key={a._id}
              activity={a}
              onEdit={(x) => { setEditing(x); setShowForm(true); }}
              onDelete={remove}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(form.name, form.email, form.password);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-wrap">
      <form onSubmit={submit} className="card auth-card">
        <h2 style={{ marginTop: 0 }}>Create your account</h2>
        <div className="form-row">
          <label>Name</label>
          <input required value={form.name} onChange={change('name')} />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={change('email')} />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={change('password')} />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Creating…' : 'Sign up'}
        </button>
        <div style={{ marginTop: 14, textAlign: 'center' }} className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}

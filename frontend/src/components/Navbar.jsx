import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const nav = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">🐾 PetPal</Link>
      <div className="nav-links">
        {user && (
          <>
            <span title={connected ? 'Socket connected' : 'Socket offline'}>
              {connected ? '🟢 Live' : '⚪ Offline'}
            </span>
            <span>Hi, {user.name}</span>
            <button
              className="btn btn-small"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  // Pub/sub for per-event subscribers
  const listenersRef = useRef({ 'activity:created': new Set(), 'pet:updated': new Set() });

  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('activity:created', (activity) => {
      listenersRef.current['activity:created'].forEach((cb) => cb(activity));
    });
    socket.on('pet:updated', (pet) => {
      listenersRef.current['pet:updated'].forEach((cb) => cb(pet));
    });
    socket.on('notification:reminder', (payload) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((t) => [...t, { id, ...payload }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5500);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const subscribe = (event, cb) => {
    const set = listenersRef.current[event];
    if (!set) return () => {};
    set.add(cb);
    return () => set.delete(cb);
  };

  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <SocketContext.Provider value={{ socket: socketRef, connected, subscribe, toasts, dismissToast }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}

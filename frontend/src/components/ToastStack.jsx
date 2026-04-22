import { useSocket } from '../context/SocketContext';

export default function ToastStack() {
  const { toasts, dismissToast } = useSocket();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id} onClick={() => dismissToast(t.id)}>
          <strong>Reminder</strong>
          <div>{t.message}</div>
          {t.dueAt && (
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Due {new Date(t.dueAt).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

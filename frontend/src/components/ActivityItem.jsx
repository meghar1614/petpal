const TYPE_ICON = {
  feeding: '🍲', walk: '🐕‍🦺', grooming: '✂️', vet: '🏥',
  medication: '💊', play: '🎾', other: '📝',
};

export default function ActivityItem({ activity, onEdit, onDelete, onToggle }) {
  return (
    <div className="card">
      <div className="row space-between">
        <h3>
          {TYPE_ICON[activity.type] || '📝'} {activity.title}
        </h3>
        <span className={`badge${activity.completed ? ' done' : ''}`}>
          {activity.completed ? 'Done' : activity.type}
        </span>
      </div>
      {activity.scheduledFor && (
        <div className="meta">Scheduled: {new Date(activity.scheduledFor).toLocaleString()}</div>
      )}
      {activity.notes && <p style={{ marginTop: 8 }}>{activity.notes}</p>}
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn btn-small" onClick={() => onToggle(activity)}>
          {activity.completed ? 'Mark pending' : 'Mark done'}
        </button>
        <button className="btn btn-small" onClick={() => onEdit(activity)}>Edit</button>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(activity)}>Delete</button>
      </div>
    </div>
  );
}

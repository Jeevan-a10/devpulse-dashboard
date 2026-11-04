'use client';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
};

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-indigo-100 text-indigo-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const STATUS_ICONS = {
  pending: '⏳',
  'in-progress': '🔄',
  completed: '✅',
};

const PRIORITY_ICONS = {
  low: '🟢',
  medium: '🔵',
  high: '🟠',
  urgent: '🔴',
};

export default function TaskCard({ task, onStatusChange, onDelete, onEdit }) {
  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const nextStatus = {
    pending: 'in-progress',
    'in-progress': 'completed',
    completed: 'pending',
  };

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${task.status === 'completed' ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        {/* Title + Description */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-slate-800 truncate ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
          )}
        </div>

        {/* Priority Badge */}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
          {PRIORITY_ICONS[task.priority]} {task.priority}
        </span>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {/* Status Toggle */}
        <button
          onClick={() => onStatusChange(task._id || task.id, nextStatus[task.status])}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[task.status]}`}
          title="Click to advance status"
        >
          {STATUS_ICONS[task.status]} {task.status}
        </button>

        {/* Category */}
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          {task.category}
        </span>

        {/* Tags */}
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">{formattedDate}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id || task.id)}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

const ACTION_ICONS = {
  task_created: { icon: '➕', bg: 'bg-blue-100 text-blue-700' },
  task_completed: { icon: '✅', bg: 'bg-emerald-100 text-emerald-700' },
  task_status_changed: { icon: '🔄', bg: 'bg-amber-100 text-amber-700' },
  task_updated: { icon: '✏️', bg: 'bg-slate-100 text-slate-700' },
  task_deleted: { icon: '🗑️', bg: 'bg-red-100 text-red-700' },
  milestone_created: { icon: '🎯', bg: 'bg-indigo-100 text-indigo-700' },
  milestone_completed: { icon: '🏆', bg: 'bg-purple-100 text-purple-700' },
  milestone_updated: { icon: '📌', bg: 'bg-sky-100 text-sky-700' },
  user_registered: { icon: '👤', bg: 'bg-violet-100 text-violet-700' },
};

export default function ActivityFeed({
  activities = [],
  summary = null,
  loading = false,
  onRefresh,
}) {
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>⚡</span> Developer Activity Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit trail of development actions and project progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Velocity: <span className="text-indigo-600 capitalize ml-1">{summary.velocity || 'steady'}</span>
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh Activity"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading activity feed...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          No recent activity recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
          {activities.map((act) => {
            const meta = ACTION_ICONS[act.action] || { icon: '⚡', bg: 'bg-slate-100 text-slate-700' };
            const id = act._id || act.id || Math.random();

            return (
              <div key={id} className="py-3 flex items-start gap-3 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${meta.bg}`}>
                  {meta.icon}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {act.userName || 'Developer'}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatTimeAgo(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 break-words">
                    {act.details || act.action.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

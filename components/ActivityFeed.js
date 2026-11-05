'use client';
import {
  PlusIcon,
  CheckIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  TargetIcon,
  TrophyIcon,
  PinIcon,
  UserIcon,
  ActivityTabIcon,
  LightningIcon,
} from '@/components/Icons';

function getActionMeta(action) {
  switch (action) {
    case 'task_created':
      return { Icon: PlusIcon, bg: 'bg-blue-50 text-blue-600 border border-blue-200' };
    case 'task_completed':
      return { Icon: CheckIcon, bg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' };
    case 'task_status_changed':
      return { Icon: RefreshIcon, bg: 'bg-amber-50 text-amber-600 border border-amber-200' };
    case 'task_updated':
      return { Icon: EditIcon, bg: 'bg-indigo-50 text-indigo-600 border border-indigo-200' };
    case 'task_deleted':
      return { Icon: TrashIcon, bg: 'bg-rose-50 text-rose-600 border border-rose-200' };
    case 'milestone_created':
      return { Icon: TargetIcon, bg: 'bg-indigo-50 text-indigo-600 border border-indigo-200' };
    case 'milestone_completed':
      return { Icon: TrophyIcon, bg: 'bg-purple-50 text-purple-600 border border-purple-200' };
    case 'milestone_updated':
      return { Icon: PinIcon, bg: 'bg-sky-50 text-sky-600 border border-sky-200' };
    case 'user_registered':
      return { Icon: UserIcon, bg: 'bg-violet-50 text-violet-600 border border-violet-200' };
    default:
      return { Icon: LightningIcon, bg: 'bg-slate-50 text-slate-600 border border-slate-200' };
  }
}

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
    <div id="activity-section" className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ActivityTabIcon className="w-5 h-5 text-indigo-600" />
            <span>Developer Activity Feed</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
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
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              title="Refresh Activity"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">Loading activity feed...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No recent activity recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
          {activities.map((act) => {
            const { Icon, bg } = getActionMeta(act.action);
            const id = act._id || act.id || Math.random();

            return (
              <div key={id} className="py-3 flex items-start gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${bg}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">
                      {act.userName || 'Developer'}
                    </span>{' '}
                    {act.details?.taskTitle ? (
                      <>
                        {act.action === 'task_created' && 'created task'}
                        {act.action === 'task_completed' && 'completed task'}
                        {act.action === 'task_status_changed' && `moved task to ${act.details.status || 'in-progress'}`}
                        {act.action === 'task_updated' && 'updated task'}
                        {act.action === 'task_deleted' && 'deleted task'}
                        {act.action === 'milestone_created' && 'created milestone'}
                        {act.action === 'milestone_completed' && 'achieved milestone'}
                        {act.action === 'milestone_updated' && 'updated milestone'}
                        {' '}
                        <span className="font-semibold text-slate-900">&ldquo;{act.details.taskTitle}&rdquo;</span>
                      </>
                    ) : (
                      act.action.replace(/_/g, ' ')
                    )}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatTimeAgo(act.timestamp || act.createdAt)}
                    </span>
                    {act.details?.category && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {act.details.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

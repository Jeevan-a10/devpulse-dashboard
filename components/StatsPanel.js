export default function StatsPanel({ stats }) {
  if (!stats) return null;

  const { total, completed, inProgress, pending, completionRate, byCategory } = stats;

  const statCards = [
    {
      label: 'Total Tasks',
      value: total,
      icon: '📋',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-800',
    },
    {
      label: 'Completed',
      value: completed,
      icon: '✅',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: '🔄',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
    {
      label: 'Pending',
      value: pending,
      icon: '⏳',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
    },
  ];

  const completionNum = parseInt(completionRate) || 0;

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon, bg, border, text }) => (
          <div
            key={label}
            className={`${bg} border ${border} rounded-xl p-4 flex flex-col gap-1`}
          >
            <span className="text-xl">{icon}</span>
            <span className={`text-2xl font-bold ${text}`}>{value}</span>
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Completion</span>
          <span className="text-sm font-bold text-indigo-600">{completionRate}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionNum}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      {byCategory && Object.keys(byCategory).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Tasks by Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byCategory).map(([cat, count]) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100"
              >
                {cat}
                <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.5 text-xs leading-none">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import {
  TasksTabIcon,
  CheckCircleIcon,
  RefreshIcon,
  ClockIcon,
} from '@/components/Icons';

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  const { total, completed, inProgress, pending, completionRate, byCategory } = stats;

  const statCards = [
    {
      label: 'Total Tasks',
      value: total,
      Icon: TasksTabIcon,
      bg: 'bg-white',
      border: 'border-slate-200/90',
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Completed',
      value: completed,
      Icon: CheckCircleIcon,
      bg: 'bg-white',
      border: 'border-slate-200/90',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'In Progress',
      value: inProgress,
      Icon: RefreshIcon,
      bg: 'bg-white',
      border: 'border-slate-200/90',
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Pending',
      value: pending,
      Icon: ClockIcon,
      bg: 'bg-white',
      border: 'border-slate-200/90',
      iconBg: 'bg-amber-50 text-amber-600',
      valueColor: 'text-amber-700',
    },
  ];

  const completionNum = parseInt(completionRate) || 0;

  return (
    <div className="space-y-4">
      {/* Stat Cards with Clean Vector SVGs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, Icon, bg, border, iconBg, valueColor }) => (
          <div
            key={label}
            className={`${bg} border ${border} rounded-2xl p-5 shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg} shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <span className={`text-3xl font-black ${valueColor} tracking-tight`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Completion</span>
          <span className="text-sm font-black text-indigo-600">{completionRate}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#242b78] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionNum}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      {byCategory && Object.keys(byCategory).length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Tasks by Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byCategory).map(([cat, count]) => (
              <span
                key={cat}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-200/60"
              >
                {cat}
                <span className="bg-[#242b78] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
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

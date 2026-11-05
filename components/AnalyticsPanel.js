'use client';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { exportAPI } from '@/lib/api';

const RATING_COLORS = {
  elite: 'bg-emerald-500 text-white',
  high: 'bg-indigo-600 text-white',
  moderate: 'bg-amber-500 text-white',
  steady: 'bg-slate-600 text-white',
};

export default function AnalyticsPanel({ analytics, loading, onRefresh }) {
  const [downloading, setDownloading] = useState(null);

  if (loading) {
    return <LoadingSpinner text="Computing engineering velocity metrics..." />;
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <p className="text-sm">No analytics data available. Ensure tasks and activity have been recorded.</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100"
          >
            Retry Analytics
          </button>
        )}
      </div>
    );
  }

  const { overview, byPriority, byCategory, milestones, weeklySummary } = analytics;

  const triggerDownload = async (type) => {
    try {
      setDownloading(type);
      const dateStr = new Date().toISOString().slice(0, 10);
      let blob;
      let filename;

      if (type === 'json') {
        const res = await exportAPI.getBackupJSON();
        blob = new Blob([res.data], { type: 'application/json' });
        filename = `devpulse-workspace-backup-${dateStr}.json`;
      } else {
        const res = await exportAPI.getTasksCSV();
        blob = new Blob([res.data], { type: 'text/csv' });
        filename = `devpulse-tasks-${dateStr}.csv`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6" id="analytics-section">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Velocity Rating */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>⚡</span> Velocity Rating
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase shadow-xs ${RATING_COLORS[overview?.throughputRating] || RATING_COLORS.steady}`}>
              {overview?.throughputRating || 'steady'}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {weeklySummary?.totalWeeklyActions || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Actions logged this week</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🎯</span> Completion Rate
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {overview?.completedTasks}/{overview?.totalTasks} tasks
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{overview?.completionRate || '0%'}</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: overview?.completionRate || '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Average Cycle Time */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>⏱️</span> Avg Turnaround
          </span>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {overview?.averageCycleTimeHours || 0} <span className="text-base font-semibold text-slate-500">hrs</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">From creation to completion</p>
          </div>
        </div>

        {/* Milestone Delivery */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🏆</span> Milestones
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {milestones?.completed}/{milestones?.total} achieved
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{milestones?.averageProgress || '0%'}</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: milestones?.averageProgress || '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Velocity Sparkline & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">7-Day Activity & Throughput</h3>
              <p className="text-xs text-slate-500">Daily breakdown of created tasks vs completed tasks</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
              Last 7 Days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {weeklySummary?.dailyVelocity?.map((day) => {
              const dayLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
              const maxVal = Math.max(
                ...weeklySummary.dailyVelocity.map((d) => Math.max(d.created, d.completed, d.actions, 1))
              );
              const heightPct = Math.min(100, Math.round(((day.created + day.completed) / maxVal) * 80) + 15);

              return (
                <div key={day.date} className="flex flex-col items-center">
                  <div className="w-full h-32 flex items-end justify-center gap-1 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                    {/* Created bar */}
                    <div
                      className="w-1/2 bg-indigo-300 rounded-t transition-all hover:bg-indigo-400"
                      style={{ height: `${Math.min(100, Math.max(10, Math.round((day.created / maxVal) * 90)))}%` }}
                      title={`Created: ${day.created}`}
                    />
                    {/* Completed bar */}
                    <div
                      className="w-1/2 bg-indigo-600 rounded-t transition-all hover:bg-indigo-700"
                      style={{ height: `${Math.min(100, Math.max(10, Math.round((day.completed / maxVal) * 90)))}%` }}
                      title={`Completed: ${day.completed}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-2">{dayLabel}</span>
                  <span className="text-[10px] text-slate-400">{day.actions} acts</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-300 rounded-sm inline-block" /> Created
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block" /> Completed
            </span>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Priority Resolution</h3>
            <p className="text-xs text-slate-500 mb-4">Completion rates partitioned by priority</p>

            <div className="space-y-3.5">
              {['urgent', 'high', 'medium', 'low'].map((p) => {
                const data = byPriority?.[p] || { total: 0, completed: 0, completionRate: '0%' };
                const badgeColor =
                  p === 'urgent'
                    ? 'text-red-600 bg-red-50'
                    : p === 'high'
                    ? 'text-amber-600 bg-amber-50'
                    : p === 'medium'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 bg-slate-50';

                return (
                  <div key={p}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold capitalize px-2 py-0.5 rounded ${badgeColor}`}>
                        {p}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {data.completed}/{data.total} ({data.completionRate})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          p === 'urgent' ? 'bg-red-500' : p === 'high' ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: data.completionRate }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Category Summary */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Domains
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.keys(byCategory || {}).map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                >
                  {cat}: {byCategory[cat].completed}/{byCategory[cat].total}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Export & Backup Hub */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <h3 className="text-lg font-bold">Workspace Backup & Export Hub</h3>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Export complete task backlogs, milestones, and audit trails for offline backup, reporting, or migration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerDownload('json')}
              disabled={downloading !== null}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 backdrop-blur-sm disabled:opacity-50"
            >
              <span>💾</span>
              {downloading === 'json' ? 'Exporting...' : 'Export JSON Backup'}
            </button>

            <button
              onClick={() => triggerDownload('csv')}
              disabled={downloading !== null}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span>📊</span>
              {downloading === 'csv' ? 'Generating...' : 'Export Tasks CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

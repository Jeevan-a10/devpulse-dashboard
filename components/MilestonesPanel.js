'use client';
import { useState } from 'react';

export default function MilestonesPanel({
  milestones = [],
  loading = false,
  onCreateMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [progress, setProgress] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onCreateMilestone({
        title: title.trim(),
        description: description.trim(),
        status,
        progress: Number(progress),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('in-progress');
      setProgress(50);
      setShowAddModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (m) => {
    const nextStatus = m.status === 'completed' ? 'in-progress' : 'completed';
    await onUpdateMilestone(m._id || m.id, {
      status: nextStatus,
      progress: nextStatus === 'completed' ? 100 : 50,
    });
  };

  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in-progress').length;
  const avgProgress = total > 0 ? Math.round(milestones.reduce((sum, m) => sum + (Number(m.progress) || (m.status === 'completed' ? 100 : 0)), 0) / total) : 0;

  return (
    <div id="milestones-section" className="space-y-6">
      {/* Tier 3: Top Summary Strip (Exact match to devpulse-milestones-tab-ui.png) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto text-sm">
          <div>
            <span className="text-slate-500 text-xs block font-medium">Total Milestones:</span>
            <span className="text-xl font-black text-slate-900">{total}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block font-medium">Completed:</span>
            <span className="text-xl font-black text-slate-900">{completed} ({total > 0 ? Math.round((completed / total) * 100) : 0}%)</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block font-medium">In Progress:</span>
            <span className="text-xl font-black text-slate-900">{inProgress}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block font-medium">Avg Progress:</span>
            <span className="text-xl font-black text-slate-900">{avgProgress}%</span>
          </div>
        </div>

        {/* Add Milestone Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#3b49df] hover:bg-[#2f3cb5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs whitespace-nowrap self-stretch md:self-auto flex items-center justify-center gap-1.5"
        >
          <span>➕</span> New Milestone
        </button>
      </div>

      {/* Milestone Cards Grid (Exact card design from devpulse-milestones-tab-ui.png) */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading roadmap milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-slate-600 font-bold">No milestones created yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "+ New Milestone" above to define your sprint objectives</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {milestones.map((m) => {
            const id = m._id || m.id;
            const isCompleted = m.status === 'completed';
            const progressVal = m.progress !== undefined ? m.progress : (isCompleted ? 100 : 0);

            return (
              <div
                key={id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Title & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {m.title}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Due Date */}
                  {m.dueDate && (
                    <p className="text-xs text-slate-500 font-medium">
                      Due: {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mr-3">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-slate-800 text-xs min-w-8 text-right">
                        {progressVal}%
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {m.description}
                    </p>
                  )}
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {m.targetTasks?.length || 1} Target Task{m.targetTasks?.length === 1 ? '' : 's'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(m)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        isCompleted
                          ? 'text-slate-500 hover:text-slate-700'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {isCompleted ? '↺ Reopen' : '✓ Done'}
                    </button>
                    {onDeleteMilestone && (
                      <button
                        onClick={() => onDeleteMilestone(id)}
                        className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Sprint Milestone</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v1.3 WebSocket Live State Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Deliverable details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Progress ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full mt-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-[#3b49df] text-white rounded-xl shadow-xs hover:bg-[#2f3cb5]"
                >
                  {submitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

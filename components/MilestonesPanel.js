'use client';
import { useState } from 'react';

const STATUS_COLORS = {
  planning: 'bg-purple-100 text-purple-700 border-purple-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

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
  const [status, setStatus] = useState('planning');
  const [progress, setProgress] = useState(0);
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
      setStatus('planning');
      setProgress(0);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>🎯</span> Roadmap & Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track key project objectives and progress towards deliverables
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Milestone
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No milestones defined yet. Click "+ Add Milestone" to plan your roadmap.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => {
            const id = m._id || m.id;
            const isCompleted = m.status === 'completed';
            const progressVal = m.progress !== undefined ? m.progress : (isCompleted ? 100 : 0);

            return (
              <div
                key={id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        STATUS_COLORS[m.status] || STATUS_COLORS.planning
                      }`}
                    >
                      {m.status}
                    </span>
                    {m.dueDate && (
                      <span className="text-xs text-slate-400">
                        Due {new Date(m.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold text-slate-800 text-sm ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {m.title}
                  </h3>
                  {m.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="font-bold text-slate-700">{progressVal}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleComplete(m)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        isCompleted
                          ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {isCompleted ? '↺ Reopen' : '✓ Complete'}
                    </button>
                    {onDeleteMilestone && (
                      <button
                        onClick={() => onDeleteMilestone(id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
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

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Add New Milestone</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. v2.0 Release Launch"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key objectives, deliverables..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Progress %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
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

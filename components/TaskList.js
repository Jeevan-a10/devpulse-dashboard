'use client';
import { useState } from 'react';

const FILTER_CATEGORIES = ['All Categories', 'Dev', 'Backend', 'Frontend', 'DevOps', 'Architecture', 'Testing', 'General'];
const FILTER_PRIORITIES = ['All Priorities', 'urgent', 'high', 'medium', 'low'];

export default function TaskList({ tasks, onStatusChange, onDelete, onEdit, onNewTask, loading }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'All Categories' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'All Priorities' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const countByStatus = {
    all: tasks.length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  const nextStatus = {
    pending: 'in-progress',
    'in-progress': 'completed',
    completed: 'pending',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div id="task-list-section" className="space-y-4">
      {/* Tier 3: Search & Filter Toolbar (Exact layout from devpulse-tasks-tab-ui.png) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative flex-1 w-full md:w-auto">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Center: Dropdowns & Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {FILTER_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 capitalize focus:outline-none"
          >
            {FILTER_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p === 'All Priorities' ? p : `${p.charAt(0).toUpperCase() + p.slice(1)} Priority`}</option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({countByStatus.all})
            </button>
            <button
              onClick={() => setStatusFilter('in-progress')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'in-progress' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({countByStatus['in-progress']})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({countByStatus.completed})
            </button>
          </div>

          {/* New Task Button */}
          {onNewTask && (
            <button
              id="new-task-btn"
              onClick={onNewTask}
              className="bg-[#3b49df] hover:bg-[#2f3cb5] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>➕</span> New Task
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Stack (Exact card design from devpulse-tasks-tab-ui.png) */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-slate-600 font-bold">No tasks match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or dropdown filters above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in-progress';

            const categoryColors = {
              Dev: 'bg-[#1e1b4b] text-indigo-200',
              Backend: 'bg-cyan-500 text-white',
              Frontend: 'bg-violet-600 text-white',
              DevOps: 'bg-purple-600 text-white',
            };

            const priorityColors = {
              urgent: 'bg-rose-100 text-rose-700',
              high: 'bg-amber-100 text-amber-700',
              medium: 'bg-blue-100 text-blue-700',
              low: 'bg-slate-100 text-slate-700',
            };

            return (
              <div
                key={task._id || task.id}
                id={`task-card-${task._id || task.id}`}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Header Row: Title on Left, Status Badge on Right */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className={`text-base font-extrabold text-slate-900 ${isCompleted ? 'text-slate-800' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 font-medium">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Status Toggle Badge */}
                  <button
                    onClick={() => onStatusChange(task._id || task.id, nextStatus[task.status])}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : isInProgress
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                    title="Click to cycle status"
                  >
                    {isCompleted ? '✓ Completed' : isInProgress ? 'In Progress' : 'Pending'}
                  </button>
                </div>

                {/* Bottom Row: Category, Priority, Tags on Left; Actions on Right */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${categoryColors[task.category] || 'bg-slate-800 text-white'}`}>
                      {task.category || 'Dev'}
                    </span>

                    {/* Priority */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg capitalize ${priorityColors[task.priority] || priorityColors.medium}`}>
                      {task.priority === 'urgent' ? '❗️ Urgent' : task.priority === 'high' ? '🔥 High' : task.priority}
                    </span>

                    {/* Tags */}
                    {task.tags?.map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      onClick={() => onDelete(task._id || task.id)}
                      className="border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>🗑️</span> Delete
                    </button>
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

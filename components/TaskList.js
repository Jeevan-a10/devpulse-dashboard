'use client';
import { useState } from 'react';
import TaskCard from './TaskCard';

const FILTER_STATUSES = ['all', 'pending', 'in-progress', 'completed'];
const FILTER_CATEGORIES = ['All', 'Dev', 'Backend', 'Frontend', 'DevOps', 'Architecture', 'Testing', 'General'];
const FILTER_PRIORITIES = ['all', 'low', 'medium', 'high', 'urgent'];

export default function TaskList({ tasks, onStatusChange, onDelete, onEdit, loading }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <div className="flex flex-wrap gap-1">
            {FILTER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority */}
          <div className="flex flex-wrap gap-1 ml-auto">
            {FILTER_PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  priorityFilter === p
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-wrap gap-1">
          {FILTER_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                categoryFilter === c
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Task Count */}
      <p className="text-sm text-slate-500 font-medium">
        Showing <span className="text-slate-800 font-bold">{filtered.length}</span> of {tasks.length} tasks
      </p>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-slate-500 font-medium">No tasks match your filters</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the search or filters above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { tasksAPI, healthAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StatsPanel from '@/components/StatsPanel';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isMyTasks = searchParams.get('filter') === 'my';

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch Tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const { data } = isMyTasks
        ? await tasksAPI.getMyTasks()
        : await tasksAPI.getAll({ limit: 50 });
      setTasks(isMyTasks ? data.data : data.data);
    } catch {
      showToast('Failed to load tasks. Is the API server running?', 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [isMyTasks]);

  // ── Fetch Stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await tasksAPI.getStats();
      setStats(data.stats);
    } catch {
      // Silently fail — stats are supplementary
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Health Check ─────────────────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const { data } = await healthAPI.check();
      setApiStatus(data.status === 'ok' ? 'online' : 'degraded');
    } catch {
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
    checkHealth();
  }, [fetchTasks, fetchStats, checkHealth]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreate = async (payload) => {
    await tasksAPI.create(payload);
    showToast('Task created successfully! 🎉');
    fetchTasks();
    fetchStats();
  };

  const handleUpdate = async (payload) => {
    await tasksAPI.update(editingTask._id || editingTask.id, payload);
    showToast('Task updated! ✅');
    fetchTasks();
    fetchStats();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tasksAPI.update(id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === id
            ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null }
            : t
        )
      );
      fetchStats();
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      showToast('Task deleted.');
      fetchStats();
    } catch {
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isMyTasks ? 'My Tasks' : 'Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* API Status Badge */}
          {apiStatus && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              apiStatus === 'online'
                ? 'bg-green-50 text-green-700 border-green-200'
                : apiStatus === 'offline'
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {apiStatus === 'online' ? '🟢' : apiStatus === 'offline' ? '🔴' : '🟡'} API {apiStatus}
            </span>
          )}

          <button
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {!isMyTasks && (
        statsLoading
          ? <div className="py-4"><LoadingSpinner text="Loading stats..." /></div>
          : <StatsPanel stats={stats} />
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        loading={tasksLoading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Task Create / Edit Modal */}
      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onClose={handleFormClose}
          initialData={editingTask}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-indigo-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

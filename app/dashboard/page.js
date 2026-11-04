'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { tasksAPI, healthAPI, milestonesAPI, activityAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StatsPanel from '@/components/StatsPanel';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import MilestonesPanel from '@/components/MilestonesPanel';
import ActivityFeed from '@/components/ActivityFeed';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isMyTasks = searchParams.get('filter') === 'my';

  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);

  const [tasksLoading, setTasksLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const [apiStatus, setApiStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load tasks
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const { data } = isMyTasks
        ? await tasksAPI.getMyTasks()
        : await tasksAPI.getAll({ limit: 50 });
      setTasks(data.data || []);
    } catch {
      showToast('Failed to load tasks. Is the API server running?', 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [isMyTasks]);

  // Load stats
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

  // Load milestones
  const fetchMilestones = useCallback(async () => {
    setMilestonesLoading(true);
    try {
      const { data } = await milestonesAPI.getAll();
      setMilestones(data.data || []);
    } catch {
      // Silently fail if endpoint pending
    } finally {
      setMilestonesLoading(false);
    }
  }, []);

  // Load activity feed
  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const [feedRes, summaryRes] = await Promise.all([
        activityAPI.getAll({ limit: 30 }),
        activityAPI.getSummary(),
      ]);
      setActivities(feedRes.data.data || []);
      setActivitySummary(summaryRes.data.summary || null);
    } catch {
      // Silently fail
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Server health check
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
    fetchMilestones();
    fetchActivity();
    checkHealth();
  }, [fetchTasks, fetchStats, fetchMilestones, fetchActivity, checkHealth]);

  // Task actions
  const handleCreateTask = async (payload) => {
    await tasksAPI.create(payload);
    showToast('Task created successfully! 🎉');
    fetchTasks();
    fetchStats();
    fetchActivity();
  };

  const handleUpdateTask = async (payload) => {
    await tasksAPI.update(editingTask._id || editingTask.id, payload);
    showToast('Task updated! ✅');
    fetchTasks();
    fetchStats();
    fetchActivity();
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
      fetchActivity();
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      showToast('Task deleted.');
      fetchStats();
      fetchActivity();
    } catch {
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Milestone actions
  const handleCreateMilestone = async (payload) => {
    try {
      await milestonesAPI.create(payload);
      showToast('Milestone created! 🎯');
      fetchMilestones();
      fetchActivity();
    } catch {
      showToast('Failed to create milestone.', 'error');
    }
  };

  const handleUpdateMilestone = async (id, payload) => {
    try {
      await milestonesAPI.update(id, payload);
      showToast('Milestone updated! ✅');
      fetchMilestones();
      fetchActivity();
    } catch {
      showToast('Failed to update milestone.', 'error');
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    try {
      await milestonesAPI.delete(id);
      setMilestones((prev) => prev.filter((m) => (m._id || m.id) !== id));
      showToast('Milestone removed.');
      fetchActivity();
    } catch {
      showToast('Failed to remove milestone.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isMyTasks ? 'My Tasks' : 'Developer Dashboard'}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📋</span> Tasks & Backlog
          <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full ml-1">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'milestones'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🎯</span> Milestones & Roadmap
          <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full ml-1">
            {milestones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>⚡</span> Activity Stream
          {activitySummary?.actionsLast24Hours > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full ml-1">
              {activitySummary.actionsLast24Hours} today
            </span>
          )}
        </button>
      </div>

      {/* Stats Panel */}
      {!isMyTasks && (
        statsLoading
          ? <div className="py-2"><LoadingSpinner text="Loading stats..." /></div>
          : <StatsPanel stats={stats} />
      )}

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <TaskList
          tasks={tasks}
          loading={tasksLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      )}

      {activeTab === 'milestones' && (
        <MilestonesPanel
          milestones={milestones}
          loading={milestonesLoading}
          onCreateMilestone={handleCreateMilestone}
          onUpdateMilestone={handleUpdateMilestone}
          onDeleteMilestone={handleDeleteMilestone}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityFeed
          activities={activities}
          summary={activitySummary}
          loading={activityLoading}
          onRefresh={fetchActivity}
        />
      )}

      {/* Task Create / Edit Modal */}
      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
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

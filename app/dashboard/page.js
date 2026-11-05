'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { tasksAPI, healthAPI, milestonesAPI, activityAPI, analyticsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StatsPanel from '@/components/StatsPanel';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import MilestonesPanel from '@/components/MilestonesPanel';
import ActivityFeed from '@/components/ActivityFeed';
import AnalyticsPanel from '@/components/AnalyticsPanel';
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
  const [analytics, setAnalytics] = useState(null);

  const [tasksLoading, setTasksLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [apiStatus, setApiStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formDefaultValues, setFormDefaultValues] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-Demo state for automated recording walkthrough
  const [demoState, setDemoState] = useState({
    running: false,
    countdown: null,
    step: '',
    stepNum: 0,
    totalSteps: 5,
  });
  const demoTimers = useRef([]);

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

  // Load analytics & velocity
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await analyticsAPI.getVelocity();
      setAnalytics(data.analytics || null);
    } catch {
      // Silently fail if endpoint offline
    } finally {
      setAnalyticsLoading(false);
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
    fetchAnalytics();
    checkHealth();
  }, [fetchTasks, fetchStats, fetchMilestones, fetchActivity, fetchAnalytics, checkHealth]);

  // Task actions
  const handleCreateTask = useCallback(async (payload) => {
    await tasksAPI.create(payload);
    showToast('Task created successfully! 🎉');
    fetchTasks();
    fetchStats();
    fetchActivity();
    fetchAnalytics();
  }, [fetchTasks, fetchStats, fetchActivity, fetchAnalytics]);

  const handleUpdateTask = useCallback(async (payload) => {
    await tasksAPI.update(editingTask._id || editingTask.id, payload);
    showToast('Task updated! ✅');
    fetchTasks();
    fetchStats();
    fetchActivity();
    fetchAnalytics();
  }, [editingTask, fetchTasks, fetchStats, fetchActivity, fetchAnalytics]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
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
      fetchAnalytics();
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  }, [fetchStats, fetchActivity, fetchAnalytics]);

  const handleDeleteTask = useCallback(async (id) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      showToast('Task deleted.');
      fetchStats();
      fetchActivity();
      fetchAnalytics();
    } catch {
      showToast('Failed to delete task.', 'error');
    }
  }, [fetchStats, fetchActivity, fetchAnalytics]);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormDefaultValues(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormDefaultValues(null);
  };

  // Milestone actions
  const handleCreateMilestone = useCallback(async (payload) => {
    try {
      await milestonesAPI.create(payload);
      showToast('Milestone created! 🎯');
      fetchMilestones();
      fetchActivity();
      fetchAnalytics();
    } catch {
      showToast('Failed to create milestone.', 'error');
    }
  }, [fetchMilestones, fetchActivity, fetchAnalytics]);

  const handleUpdateMilestone = useCallback(async (id, payload) => {
    try {
      await milestonesAPI.update(id, payload);
      showToast('Milestone updated! ✅');
      fetchMilestones();
      fetchActivity();
      fetchAnalytics();
    } catch {
      showToast('Failed to update milestone.', 'error');
    }
  }, [fetchMilestones, fetchActivity, fetchAnalytics]);

  const handleDeleteMilestone = useCallback(async (id) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    try {
      await milestonesAPI.delete(id);
      setMilestones((prev) => prev.filter((m) => (m._id || m.id) !== id));
      showToast('Milestone removed.');
      fetchMilestones();
      fetchActivity();
      fetchAnalytics();
    } catch {
      showToast('Failed to remove milestone.', 'error');
    }
  }, [fetchMilestones, fetchActivity, fetchAnalytics]);

  // ── Auto Demo Playback Controller ──────────────────────────────────────────
  const stopAutoDemo = useCallback(() => {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setShowForm(false);
    setEditingTask(null);
    setFormDefaultValues(null);
    setDemoState({ running: false, countdown: null, step: '', stepNum: 0, totalSteps: 5 });
  }, []);

  const startAutoDemo = useCallback(() => {
    stopAutoDemo();
    setDemoState({
      running: true,
      countdown: 3,
      step: 'Get ready! Recording starts in 3...',
      stepNum: 0,
      totalSteps: 5,
    });

    const c1 = setTimeout(() => {
      setDemoState((s) => ({ ...s, countdown: 2, step: 'Get ready! Recording starts in 2...' }));
    }, 1000);

    const c2 = setTimeout(() => {
      setDemoState((s) => ({ ...s, countdown: 1, step: 'Get ready! Recording starts in 1...' }));
    }, 2000);

    const c3 = setTimeout(() => {
      setDemoState({
        running: true,
        countdown: null,
        step: 'Overview & Task Backlog',
        stepNum: 1,
        totalSteps: 5,
      });
      setActiveTab('tasks');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Step 2: Visibly click "+ New Task" and open the Add Task modal ("➕ New Task" / "Create Task")
      const t1 = setTimeout(() => {
        setDemoState((s) => ({ ...s, step: 'Adding a New Task: Cloud Deployment', stepNum: 2 }));
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const btn = document.getElementById('new-task-btn');
        if (btn) btn.classList.add('ring-4', 'ring-indigo-300', 'scale-105');

        setTimeout(() => {
          if (btn) btn.classList.remove('ring-4', 'ring-indigo-300', 'scale-105');
          setEditingTask(null);
          setFormDefaultValues({
            title: 'Deploy to Vercel & MongoDB Atlas',
            description: 'Production cloud setup with custom domain and DB cluster',
            category: 'DevOps',
            priority: 'high',
            status: 'in-progress',
            tags: 'cloud, vercel, mongodb',
          });
          setShowForm(true);
        }, 500);

        // Keep Add Task modal visibly open for 3 seconds, then submit and close
        const t1b = setTimeout(async () => {
          await handleCreateTask({
            title: 'Deploy to Vercel & MongoDB Atlas',
            description: 'Production cloud setup with custom domain and DB cluster',
            category: 'DevOps',
            priority: 'high',
            status: 'in-progress',
            tags: ['cloud', 'vercel', 'mongodb'],
          });
          setShowForm(false);
          setFormDefaultValues(null);

          setTimeout(() => {
            const list = document.getElementById('task-list-section');
            if (list) list.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 400);
        }, 3500);
        demoTimers.current.push(t1b);
      }, 2500);

      // Step 3: Visibly open the Edit Task modal on an existing task ("✏️ Edit Task" / "Update Task")
      const t2 = setTimeout(async () => {
        setDemoState((s) => ({ ...s, step: 'Editing Task: Elevating Priority to Urgent', stepNum: 3 }));
        const listEl = document.getElementById('task-list-section');
        if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const targetTask = tasks.find((t) => t.status !== 'completed') || tasks[0];
        if (targetTask) {
          const cardEl = document.getElementById(`task-card-${targetTask._id || targetTask.id}`);
          if (cardEl) cardEl.classList.add('ring-2', 'ring-indigo-500');

          setTimeout(() => {
            if (cardEl) cardEl.classList.remove('ring-2', 'ring-indigo-500');
            // Visibly open Edit Modal on screen!
            setFormDefaultValues(null);
            setEditingTask({
              ...targetTask,
              priority: 'urgent',
              status: 'completed',
            });
            setShowForm(true);

            // Keep Edit modal visibly open for 3 seconds, then save
            const t2b = setTimeout(async () => {
              try {
                await tasksAPI.update(targetTask._id || targetTask.id, {
                  title: targetTask.title,
                  description: targetTask.description,
                  category: targetTask.category,
                  priority: 'urgent',
                  status: 'completed',
                  tags: targetTask.tags || [],
                });
                showToast('Task updated! ✅');
                fetchTasks();
                fetchStats();
                fetchActivity();
              } catch {
                // ignore
              }
              setShowForm(false);
              setEditingTask(null);

              setTimeout(() => {
                const updatedCard = document.getElementById(`task-card-${targetTask._id || targetTask.id}`);
                if (updatedCard) {
                  updatedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  updatedCard.classList.add('ring-2', 'ring-green-500');
                  setTimeout(() => updatedCard.classList.remove('ring-2', 'ring-green-500'), 1500);
                }
              }, 300);
            }, 3000);
            demoTimers.current.push(t2b);
          }, 600);
        }
      }, 7200);

      // Step 4: Switch to Milestones Tab and update milestone progress
      const t3 = setTimeout(async () => {
        setDemoState((s) => ({ ...s, step: 'Sprint Milestones & Roadmap', stepNum: 4 }));
        setActiveTab('milestones');
        setTimeout(() => {
          const mSection = document.getElementById('milestones-section');
          if (mSection) mSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        const t3b = setTimeout(async () => {
          if (milestones.length > 0) {
            const activeMilestone = milestones.find((m) => m.status !== 'completed') || milestones[0];
            await handleUpdateMilestone(activeMilestone._id || activeMilestone.id, {
              status: 'completed',
              progress: 100,
            });
          }
        }, 2500);
        demoTimers.current.push(t3b);
      }, 12500);

      // Step 5: Switch to Activity Stream Tab showing recent logs
      const t4 = setTimeout(() => {
        setDemoState((s) => ({ ...s, step: 'Real-time Activity Stream & Audit Log', stepNum: 5 }));
        setActiveTab('activity');
        setTimeout(() => {
          const aSection = document.getElementById('activity-section');
          if (aSection) aSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }, 18500);

      // Step 6: Return to Tasks Overview and Finish
      const t5 = setTimeout(() => {
        setActiveTab('tasks');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const t6 = setTimeout(() => {
          stopAutoDemo();
        }, 3000);
        demoTimers.current.push(t6);
      }, 24500);

      demoTimers.current.push(t1, t2, t3, t4, t5);
    }, 3000);

    demoTimers.current.push(c1, c2, c3);
  }, [stopAutoDemo, tasks, milestones, handleStatusChange, handleCreateTask, handleUpdateMilestone, fetchTasks, fetchStats, fetchActivity]);

  // Escape key to stop demo, Shift+D to start silently
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && demoState.running) {
        stopAutoDemo();
      }
      if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !demoState.running) {
        startAutoDemo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoState.running, stopAutoDemo, startAutoDemo]);

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

        <div className="flex items-center gap-2.5">
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

          {/* New Task Button */}
          <button
            id="new-task-btn"
            onClick={() => { setEditingTask(null); setFormDefaultValues(null); setShowForm(true); }}
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

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📊</span> Velocity & Reports
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

      {activeTab === 'analytics' && (
        <AnalyticsPanel
          analytics={analytics}
          loading={analyticsLoading}
          onRefresh={fetchAnalytics}
        />
      )}

      {/* Task Create / Edit Modal */}
      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={handleFormClose}
          initialData={editingTask}
          defaultValues={formDefaultValues}
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

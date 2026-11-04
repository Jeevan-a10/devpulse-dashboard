'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const handleCreateTask = useCallback(async (payload) => {
    await tasksAPI.create(payload);
    showToast('Task created successfully! 🎉');
    fetchTasks();
    fetchStats();
    fetchActivity();
  }, [fetchTasks, fetchStats, fetchActivity]);

  const handleUpdateTask = useCallback(async (payload) => {
    await tasksAPI.update(editingTask._id || editingTask.id, payload);
    showToast('Task updated! ✅');
    fetchTasks();
    fetchStats();
    fetchActivity();
  }, [editingTask, fetchTasks, fetchStats, fetchActivity]);

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
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  }, [fetchStats, fetchActivity]);

  const handleDeleteTask = useCallback(async (id) => {
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
  }, [fetchStats, fetchActivity]);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Milestone actions
  const handleCreateMilestone = useCallback(async (payload) => {
    try {
      await milestonesAPI.create(payload);
      showToast('Milestone created! 🎯');
      fetchMilestones();
      fetchActivity();
    } catch {
      showToast('Failed to create milestone.', 'error');
    }
  }, [fetchMilestones, fetchActivity]);

  const handleUpdateMilestone = useCallback(async (id, payload) => {
    try {
      await milestonesAPI.update(id, payload);
      showToast('Milestone updated! ✅');
      fetchMilestones();
      fetchActivity();
    } catch {
      showToast('Failed to update milestone.', 'error');
    }
  }, [fetchMilestones, fetchActivity]);

  const handleDeleteMilestone = useCallback(async (id) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    try {
      await milestonesAPI.delete(id);
      setMilestones((prev) => prev.filter((m) => (m._id || m.id) !== id));
      showToast('Milestone removed.');
      fetchActivity();
    } catch {
      showToast('Failed to remove milestone.', 'error');
    }
  }, [fetchActivity]);

  // ── Auto Demo Playback Controller ──────────────────────────────────────────
  const stopAutoDemo = useCallback(() => {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setShowForm(false);
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

      // Step 2: Cycle first task status
      const t1 = setTimeout(async () => {
        setDemoState((s) => ({ ...s, step: 'Cycling task status (Pending → Completed)', stepNum: 2 }));
        if (tasks.length > 0) {
          const firstTask = tasks[0];
          await handleStatusChange(firstTask._id || firstTask.id, 'completed');
        }
      }, 4000);

      // Step 3: Automatically create a new task
      const t2 = setTimeout(async () => {
        setDemoState((s) => ({ ...s, step: 'Creating new task: Deploy to Vercel & Atlas', stepNum: 3 }));
        await handleCreateTask({
          title: 'Deploy to Vercel & MongoDB Atlas',
          category: 'DevOps',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        });
      }, 10000);

      // Step 4: Switch to Milestones Tab and complete a milestone
      const t3 = setTimeout(async () => {
        setDemoState((s) => ({ ...s, step: 'Milestones & Roadmap Progress', stepNum: 4 }));
        setActiveTab('milestones');
        window.scrollTo({ top: 120, behavior: 'smooth' });

        const t3b = setTimeout(async () => {
          if (milestones.length > 0) {
            const activeMilestone = milestones.find((m) => m.status !== 'completed') || milestones[0];
            await handleUpdateMilestone(activeMilestone._id || activeMilestone.id, {
              status: 'completed',
              progress: 100,
            });
          }
        }, 3000);
        demoTimers.current.push(t3b);
      }, 17000);

      // Step 5: Switch to Activity Stream
      const t4 = setTimeout(() => {
        setDemoState((s) => ({ ...s, step: 'Real-Time Developer Activity Audit Stream', stepNum: 5 }));
        setActiveTab('activity');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 25000);

      // Step 6: Finish Demo
      const t5 = setTimeout(() => {
        setDemoState({
          running: true,
          countdown: null,
          step: '✨ Demo Complete! Hit Stop Recording now (Cmd + Ctrl + Esc)',
          stepNum: 5,
          totalSteps: 5,
        });
        const t6 = setTimeout(() => {
          stopAutoDemo();
        }, 5000);
        demoTimers.current.push(t6);
      }, 32000);

      demoTimers.current.push(t1, t2, t3, t4, t5);
    }, 3000);

    demoTimers.current.push(c1, c2, c3);
  }, [stopAutoDemo, tasks, milestones, handleStatusChange, handleCreateTask, handleUpdateMilestone]);

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
      {/* 3-second Countdown Banner (Only visible during countdown, completely hidden during recording) */}
      {demoState.countdown && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-6 py-2.5 rounded-full shadow-2xl border border-indigo-500/50 flex items-center gap-3 text-sm animate-bounce">
          <span className="font-bold text-amber-300">
            🎬 Auto-Demo starting in {demoState.countdown}... Press Record!
          </span>
        </div>
      )}

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

          {/* Auto-Run Demo Button: COMPLETELY HIDDEN during recording */}
          {!demoState.running && (
            <button
              onClick={startAutoDemo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              title="Click or press Shift+D to automatically drive the demo. Button hides automatically during recording."
            >
              <span>▶</span> Auto-Run Demo (30s)
            </button>
          )}

          {/* New Task Button */}
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

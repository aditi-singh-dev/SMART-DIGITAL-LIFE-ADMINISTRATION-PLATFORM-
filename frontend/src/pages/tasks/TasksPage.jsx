import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  AlertCircle, 
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare
} from 'lucide-react';
import TaskModal from './TaskModal';
import WhatsAppReminderModal from '../../components/common/WhatsAppReminderModal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function TasksPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine' | 'assigned_by_me' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [whatsappModalTask, setWhatsappModalTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { tab: activeTab };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedPriority !== 'all') params.priority = selectedPriority;

      const res = await api.getTasks(params);
      if (res.success) {
        setTasks(res.tasks || []);
      }
    } catch (e) {
      error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('refresh:tasks', handleRefresh);
    return () => window.removeEventListener('refresh:tasks', handleRefresh);
  }, [activeTab, searchQuery, selectedPriority]);

  const handleToggle = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: res.status } : t));
        success(res.status === 'completed' ? 'Task completed!' : 'Task reopened.');
      }
    } catch (err) {
      error('Failed to toggle status.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        success('Task deleted.');
        fetchTasks();
      }
    } catch (err) {
      error('Could not delete task.');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Medium</span>;
      default:
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Family Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share administrative responsibilities and ensure nothing slips through the cracks.
          </p>
        </div>

        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'mine', label: 'My Tasks' },
          { key: 'assigned_by_me', label: 'Assigned by Me' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in this view"
          description="Create a task and assign it to a family member."
          actionLabel="Assign First Task"
          onAction={() => { setEditingTask(null); setModalOpen(true); }}
        />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start sm:items-center justify-between gap-4 ${
                  isCompleted ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40' : ''
                }`}
              >
                {/* Left check & title */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      {task.is_overdue && !isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Assigned to: {task.assignee_name || 'Family'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {task.due_date}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setWhatsappModalTask(task)}
                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingTask(task); setModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSaved={fetchTasks}
          task={editingTask}
        />
      )}

      {/* WhatsApp Reminder Modal */}
      {whatsappModalTask && (
        <WhatsAppReminderModal
          isOpen={!!whatsappModalTask}
          onClose={() => setWhatsappModalTask(null)}
          targetItem={whatsappModalTask}
        />
      )}
    </div>
  );
}

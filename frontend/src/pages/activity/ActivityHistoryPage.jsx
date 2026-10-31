import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { History, Clock, User, FileText, CheckCircle, FolderKanban, Users } from 'lucide-react';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function ActivityHistoryPage() {
  const { error } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        const res = await api.getActivityHistory();
        if (res.success) {
          setActivities(res.activities || []);
        }
      } catch (e) {
        error('Failed to load activity logs.');
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'task':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'workflow':
        return <FolderKanban className="w-4 h-4 text-amber-600" />;
      case 'family':
      case 'user':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Activity History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Transparent chronological audit log of actions performed across the family workspace.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">No recorded activity history yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {activities.map((act) => {
              const dateObj = new Date(act.created_at);
              const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={act.id} className="relative flex items-start gap-4 text-xs group">
                  {/* Timeline circle icon */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                  </div>

                  <div className="flex-1 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{act.user_name}</span>
                        <span className="text-slate-600 dark:text-slate-300">{act.action}</span>
                        {act.entity_name && (
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                            "{act.entity_name}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{dateStr} at {timeStr}</span>
                      </div>
                    </div>

                    {act.details && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">{act.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import CreateWorkflowModal from './CreateWorkflowModal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const { error } = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getWorkflows(params);
      if (res.success) {
        setWorkflows(res.workflows || []);
      }
    } catch (e) {
      error('Failed to load administrative workflows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const handleRefresh = () => fetchWorkflows();
    window.addEventListener('refresh:workflows', handleRefresh);
    return () => window.removeEventListener('refresh:workflows', handleRefresh);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Life Admin</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track paperwork, administrative requirements, and readiness without missing a step.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'active', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Workflows Cards Grid */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No administrative workflows yet"
          description="Start a scholarship application, college admission, or passport renewal checklist."
          actionLabel="Create Workflow"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((wf) => {
            const isCompleted = wf.readiness === 100;
            return (
              <div
                key={wf.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50">
                      {wf.category || 'General'}
                    </span>

                    {wf.deadline && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Deadline: {wf.deadline}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {wf.title}
                  </h3>
                  {wf.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {wf.description}
                    </p>
                  )}

                  {/* Readiness Progress Bar (Section 8) */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Readiness</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{wf.readiness}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' :
                          wf.readiness >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${wf.readiness}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {wf.completed_items} of {wf.total_items} requirements ready
                    </p>
                  </div>

                  {/* Missing documents bullet points */}
                  {wf.missing_documents && wf.missing_documents.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
                        Missing Requirements ({wf.missing_documents.length})
                      </span>
                      <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 pl-3 list-disc">
                        {wf.missing_documents.slice(0, 3).map((item, i) => (
                          <li key={i} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Continue button */}
                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => navigate(`/workflows/${wf.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                  >
                    <span>Continue Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <CreateWorkflowModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={fetchWorkflows}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  FolderKanban, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  ArrowLeft,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import LinkDocumentModal from './LinkDocumentModal';
import Modal from '../../components/common/Modal';

export default function WorkflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeItemForLink, setActiveItemForLink] = useState(null);

  // Add Item Modal
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(true);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkflowById(id);
      if (res.success) {
        setWorkflow(res.workflow);
      }
    } catch (e) {
      error('Failed to load workflow.');
      navigate('/workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const handleToggleItem = async (item) => {
    try {
      const newCompleted = item.completed === 1 ? 0 : 1;
      const res = await api.updateChecklistItem(item.id, { completed: newCompleted });
      if (res.success) {
        success(newCompleted === 1 ? 'Marked requirement ready.' : 'Marked requirement pending.');
        fetchWorkflow();
      }
    } catch (err) {
      error('Failed to update requirement status.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      const res = await api.addChecklistItem(id, {
        title: newItemTitle.trim(),
        required: newItemRequired ? 1 : 0
      });
      if (res.success) {
        success('Requirement added to checklist.');
        setNewItemTitle('');
        setAddItemOpen(false);
        fetchWorkflow();
      }
    } catch (err) {
      error('Failed to add checklist item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this requirement from workflow?')) return;
    try {
      const res = await api.deleteChecklistItem(itemId);
      if (res.success) {
        success('Requirement removed.');
        fetchWorkflow();
      }
    } catch (err) {
      error('Failed to delete item.');
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!window.confirm(`Permanently delete administrative workflow "${workflow.title}"?`)) return;
    try {
      const res = await api.deleteWorkflow(id);
      if (res.success) {
        success('Workflow deleted.');
        navigate('/workflows');
      }
    } catch (err) {
      error('Failed to delete workflow.');
    }
  };

  if (loading || !workflow) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading checklist details...</div>;
  }

  const items = workflow.items || [];
  const readyItems = items.filter(i => i.completed === 1 || i.document_id);
  const missingItems = items.filter(i => i.completed === 0 && !i.document_id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/workflows"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </Link>

        <button
          onClick={handleDeleteWorkflow}
          className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          Delete Workflow
        </button>
      </div>

      {/* Main Readiness Header Card (Section 7, 8, 14) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {workflow.category}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                workflow.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
              }`}>
                {workflow.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{workflow.title}</h1>
            {workflow.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">{workflow.description}</p>
            )}
          </div>

          {/* Deadline Pill */}
          {workflow.deadline && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2.5 flex-shrink-0">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Deadline</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{workflow.deadline}</span>
              </div>
            </div>
          )}
        </div>

        {/* Readiness Score Progress Bar (Section 8) */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Application Readiness</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{workflow.readiness}% Ready</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                workflow.readiness === 100 ? 'bg-emerald-500' :
                workflow.readiness >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
              }`}
              style={{ width: `${workflow.readiness}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>{readyItems.length} of {items.length} requirements ready</span>
            <span>{missingItems.length} document{missingItems.length === 1 ? '' : 's'} missing</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Requirements Checklist (Section 14) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Mandatory Documents & Checklist
          </h3>
          <button
            onClick={() => setAddItemOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Requirement</span>
          </button>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => {
            const isReady = item.completed === 1 || item.document_id;
            return (
              <div 
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleItem(item)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                    title={isReady ? 'Mark missing' : 'Mark ready'}
                  >
                    {isReady ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isReady ? 'text-slate-900 dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.title}
                      </span>
                      {item.required === 1 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Required</span>
                      )}
                      {isReady ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Available
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Missing
                        </span>
                      )}
                    </div>

                    {/* Linked Document Information */}
                    {item.linked_doc_title ? (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/60 w-fit">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium truncate">{item.linked_doc_title}</span>
                        <a
                          href={item.linked_doc_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5 ml-1 text-indigo-800 dark:text-indigo-200 font-semibold"
                        >
                          <span>View Doc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        No copy attached from vault yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  {!item.linked_doc_title && (
                    <button
                      onClick={() => setActiveItemForLink(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Attach from Vault</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Link Document Modal */}
      {activeItemForLink && (
        <LinkDocumentModal
          isOpen={!!activeItemForLink}
          onClose={() => setActiveItemForLink(null)}
          item={activeItemForLink}
          onLinked={fetchWorkflow}
        />
      )}

      {/* Add Custom Requirement Modal */}
      {addItemOpen && (
        <Modal
          isOpen={addItemOpen}
          onClose={() => setAddItemOpen(false)}
          title="Add Custom Requirement"
          subtitle={`Add another checklist item to "${workflow.title}"`}
        >
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Requirement / Document Title *
              </label>
              <input
                type="text"
                required
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="e.g. Domicile Certificate or Affidavit"
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newItemRequired}
                onChange={(e) => setNewItemRequired(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Mark as mandatory required item</span>
            </label>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddItemOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Add Requirement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, X, Files, CheckSquare, FolderKanban, Users, ArrowRight } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ documents: [], tasks: [], workflows: [], members: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ documents: [], tasks: [], workflows: [], members: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.globalSearch(query);
        if (res.success) {
          setResults(res.results);
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const totalResults = 
    results.documents.length + 
    results.tasks.length + 
    results.workflows.length + 
    results.members.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50 dark:bg-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, tasks, workflows, family members..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              Searching family database...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Type keywords such as "insurance", "passport", "scholarship", or family member names.
            </div>
          )}

          {/* Group: Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Files className="w-3.5 h-3.5" /> Documents
              </div>
              <div className="space-y-1">
                {results.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => { onClose(); navigate('/vault'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.category} · {doc.owner_name}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group: Workflows */}
          {results.workflows.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" /> Administrative Workflows
              </div>
              <div className="space-y-1">
                {results.workflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => { onClose(); navigate(`/workflows/${wf.id}`); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{wf.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{wf.category} · {wf.status}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group: Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> Family Tasks
              </div>
              <div className="space-y-1">
                {results.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => { onClose(); navigate('/tasks'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Assigned to: {task.assignee_name || 'Unassigned'} · Due: {task.due_date}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group: Members */}
          {results.members.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Family Members
              </div>
              <div className="space-y-1">
                {results.members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => { onClose(); navigate('/family/members'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ backgroundColor: m.avatar_color }}
                      >
                        {m.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{m.full_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.relationship || m.role} · {m.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

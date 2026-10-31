import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { 
  FileText, 
  Download, 
  Trash2, 
  Calendar, 
  User, 
  Building, 
  Lock, 
  Users, 
  CheckCircle2, 
  ExternalLink,
  Edit2
} from 'lucide-react';

export default function DocumentDetailModal({ isOpen, onClose, document: doc, onDeleted, onUpdated }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(doc?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!doc) return null;

  const canEdit = doc.owner_id === user?.id || user?.familyRole === 'admin';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.title}"?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.deleteDocument(doc.id);
      if (res.success) {
        success('Document deleted successfully.');
        onDeleted?.();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const res = await api.updateDocument(doc.id, { notes: editNotes });
      if (res.success) {
        success('Notes updated.');
        setEditing(false);
        onUpdated?.();
      }
    } catch (err) {
      error(err.message || 'Failed to update notes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Overview"
      subtitle={`${doc.category} · Stored securely in vault`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Document Header Card */}
        <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 dark:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-5 h-5 text-white stroke-[1.8]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-snug">{doc.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.document_type || doc.category}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {doc.category}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                  doc.visibility === 'private' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {doc.visibility === 'private' ? <Lock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  <span>{doc.visibility === 'private' ? 'Private' : 'Family Shared'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Owner</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 mt-1">
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: doc.owner_color || '#4F46E5' }}
              >
                {doc.owner_name?.substring(0, 1)}
              </div>
              <span>{doc.owner_name}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Issuing Organization</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block truncate">
              {doc.issuing_authority || 'Not Specified'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Issue Date</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
              {doc.issue_date || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Expiry Date</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
              {doc.expiry_date ? (
                <span className={doc.days_remaining !== null && doc.days_remaining <= 30 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                  {doc.expiry_date} ({doc.days_remaining !== null ? `${doc.days_remaining}d left` : ''})
                </span>
              ) : 'Does not expire'}
            </span>
          </div>
        </div>

        {/* Notes & Locker References */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Notes & Physical Locker References
            </span>
            {canEdit && !editing && (
              <button 
                onClick={() => setEditing(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={loading}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
              {doc.notes || 'No extra notes or locker details attached.'}
            </p>
          )}
        </div>

        {/* Action Buttons: Download & Delete */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {canEdit ? (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>
          ) : <div />}

          <a
            href={doc.file_url}
            target="_blank"
            rel="noreferrer"
            download={doc.original_filename}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Document</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}

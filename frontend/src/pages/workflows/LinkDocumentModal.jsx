import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileText, Check, Plus } from 'lucide-react';

export default function LinkDocumentModal({ isOpen, onClose, item, onLinked }) {
  const { success, error } = useToast();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVaultDocs() {
      try {
        const res = await api.getDocuments();
        if (res.success) {
          setDocuments(res.documents || []);
        }
      } catch (e) {}
    }
    if (isOpen) {
      fetchVaultDocs();
    }
  }, [isOpen]);

  const handleLink = async () => {
    if (!selectedDocId) {
      error('Please select a document from your vault.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateChecklistItem(item.id, {
        document_id: selectedDocId,
        completed: 1
      });
      if (res.success) {
        success(`Attached document to "${item.title}". Readiness score updated!`);
        onLinked?.();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to attach document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Document from Vault"
      subtitle={`Fulfill requirement: "${item?.title}"`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Select an existing verified document from your family vault to attach to this checklist item.
        </p>

        {documents.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
            No documents found in vault. Upload one to your vault first!
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <div className="truncate">
                      <p className="truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{doc.category} · {doc.owner_name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={loading || !selectedDocId}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Attaching...' : 'Attach Document'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

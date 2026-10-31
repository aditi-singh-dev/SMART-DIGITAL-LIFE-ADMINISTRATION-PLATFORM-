import React, { useState, useRef, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Check, 
  Calendar, 
  Lock, 
  Users, 
  X,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Identity',
  'Education',
  'Vehicle',
  'Insurance',
  'Property',
  'Financial',
  'Employment',
  'Warranty',
  'Government',
  'Other'
];

export default function DocumentUploadModal({ isOpen, onClose, onUploaded }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Identity',
    document_type: '',
    owner_id: user?.id || '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    visibility: 'family',
    notes: ''
  });

  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await api.getFamily();
        if (res.success && res.family?.members) {
          setFamilyMembers(res.family.members);
        }
      } catch (e) {}
    }
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    // Auto-populate title if empty
    const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: cleanTitle }));
    }

    // Trigger Intelligent Classification Suggestion
    setClassifying(true);
    try {
      const res = await api.classifyDocument({
        filename: selectedFile.name,
        title: cleanTitle
      });
      if (res.success && res.suggestion) {
        setSuggestion(res.suggestion);
      }
    } catch (e) {
      console.warn('Auto classification suggestion skipped:', e);
    } finally {
      setClassifying(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion) return;
    setFormData(prev => ({
      ...prev,
      category: suggestion.suggestedCategory || prev.category,
      document_type: suggestion.suggestedDocType || prev.document_type
    }));
    setSuggestion(null);
    success('Intelligent suggestion accepted!');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      error('Please select or drop a file to upload.');
      return;
    }
    if (!formData.title.trim()) {
      error('Please specify a document title.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('document_type', formData.document_type.trim() || formData.title.trim());
      data.append('owner_id', formData.owner_id || user.id);
      data.append('issue_date', formData.issue_date || '');
      data.append('expiry_date', formData.expiry_date || '');
      data.append('issuing_authority', formData.issuing_authority.trim() || '');
      data.append('visibility', formData.visibility);
      data.append('notes', formData.notes.trim() || '');

      const res = await api.uploadDocument(data);
      if (res.success) {
        success('Document uploaded and encrypted in Family Vault!');
        onUploaded?.();
        handleClose();
      }
    } catch (err) {
      error(err.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSuggestion(null);
    setFormData({
      title: '',
      category: 'Identity',
      document_type: '',
      owner_id: user?.id || '',
      issue_date: '',
      expiry_date: '',
      issuing_authority: '',
      visibility: 'family',
      notes: ''
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Family Document"
      subtitle="Store, categorize and track vital records in the family vault"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.txt"
            />
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Drop your document here</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or click to browse files from your device</p>
            <span className="inline-block mt-3 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              PDF, JPG, PNG, WEBP (Up to 25 MB)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3 truncate min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setSuggestion(null); }}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Intelligent Auto-Classification Banner (Section 11 & 13) */}
        {suggestion && (
          <div className="p-3.5 bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Suggested by GharSahayak AI</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                {suggestion.confidence}% confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Category</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{suggestion.suggestedCategory}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Document Type</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{suggestion.suggestedDocType}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-indigo-100 dark:border-indigo-800/50">
              <p className="text-[11px] text-indigo-800 dark:text-indigo-300 italic">{suggestion.rationale}</p>
              <button
                type="button"
                onClick={handleAcceptSuggestion}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" /> Accept Suggestion
              </button>
            </div>
          </div>
        )}

        {/* Metadata Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Vehicle Insurance Policy (Hyundai Creta)"
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Specific Document Type
              </label>
              <input
                type="text"
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                placeholder="e.g. Vehicle Insurance, RC, Aadhaar"
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Owner / Family Member
              </label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {familyMembers.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.full_name} ({m.relationship || m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Issuing Organization
              </label>
              <input
                type="text"
                value={formData.issuing_authority}
                onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                placeholder="e.g. UIDAI, ICICI Lombard, CBSE"
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Issue Date (Optional)
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Tracked automatically in Expiry Radar if provided</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Privacy / Visibility
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'family' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    formData.visibility === 'family'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Shared with Family</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'private' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    formData.visibility === 'private'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private Only</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notes & Policy/Account Details
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Policy numbers, remarks, locker ref..."
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            <span>{loading ? 'Uploading & Encrypting...' : 'Save to Family Vault'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

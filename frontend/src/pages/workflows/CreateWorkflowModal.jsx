import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FolderKanban, Plus, Sparkles, Check, Trash2 } from 'lucide-react';

const TEMPLATES = [
  { key: 'scholarship_application', title: 'Scholarship Application', category: 'Education', desc: 'Marksheet, admission proof, photo, income cert' },
  { key: 'college_admission', title: 'College Admission', category: 'Education', desc: '10th/12th marksheet, transfer cert, migration, ID' },
  { key: 'vehicle_insurance_renewal', title: 'Vehicle Insurance Renewal', category: 'Vehicle', desc: 'Previous policy, RC copy, PUC certificate' },
  { key: 'passport_renewal', title: 'Passport Renewal', category: 'Identity', desc: 'Old passport, Aadhaar, address proof, photos' },
  { key: 'school_admission', title: 'School Admission', category: 'Education', desc: 'Birth certificate, immunization record, photos' },
  { key: 'warranty_claim', title: 'Appliance Warranty Claim', category: 'Warranty', desc: 'Purchase invoice, stamped warranty card' },
  { key: 'government_application', title: 'Government Application', category: 'Government', desc: 'Aadhaar, ration card, domicile certificate' },
  { key: 'custom', title: 'Custom Workflow', category: 'General', desc: 'Build your own custom requirements checklist' }
];

export default function CreateWorkflowModal({ isOpen, onClose, onCreated }) {
  const { success, error } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('scholarship_application');
  const [title, setTitle] = useState('Scholarship Application');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customItems, setCustomItems] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleTemplateChange = (tmplKey) => {
    setSelectedTemplate(tmplKey);
    const tmpl = TEMPLATES.find(t => t.key === tmplKey);
    if (tmpl && tmplKey !== 'custom') {
      setTitle(tmpl.title);
      setDescription(tmpl.desc);
    } else {
      setTitle('');
      setDescription('');
    }
  };

  const handleAddCustomItem = () => {
    setCustomItems([...customItems, '']);
  };

  const handleCustomItemChange = (index, val) => {
    const updated = [...customItems];
    updated[index] = val;
    setCustomItems(updated);
  };

  const handleRemoveCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Please enter a workflow title.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        template_key: selectedTemplate,
        title: title.trim(),
        description: description.trim(),
        deadline
      };

      if (selectedTemplate === 'custom') {
        payload.custom_items = customItems.filter(i => i.trim().length > 0);
      }

      const res = await api.createWorkflow(payload);
      if (res.success) {
        success('Administrative workflow created!');
        onCreated?.();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to create workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Administrative Workflow"
      subtitle="Track paperwork, requirements, and readiness before application deadlines"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Workflow Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.key;
              return (
                <div
                  key={tmpl.key}
                  onClick={() => handleTemplateChange(tmpl.key)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{tmpl.title}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">{tmpl.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Workflow Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. National Scholarship Application"
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Application / Submission Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description & Scheme Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Counseling instructions, eligibility criteria, portal links..."
            rows={2}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* If Custom template selected, allow adding custom items */}
        {selectedTemplate === 'custom' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Checklist Requirements
              </label>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {customItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleCustomItemChange(idx, e.target.value)}
                    placeholder={`Requirement #${idx + 1} (e.g. Income Certificate)`}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                  {customItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem(idx)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Initialize Workflow'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

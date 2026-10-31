import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Settings, ShieldCheck, Save, KeyRound, Copy, Check } from 'lucide-react';

export default function FamilySettingsPage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [family, setFamily] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getFamily();
        if (res.success && res.family) {
          setFamily(res.family);
          setFamilyName(res.family.family_name);
        }
      } catch (e) {}
    }
    load();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    try {
      const res = await api.updateFamily({ family_name: familyName.trim() });
      if (res.success) {
        success('Family workspace updated!');
        await refreshUser();
      }
    } catch (err) {
      error(err.message || 'Failed to update family workspace.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.familyRole === 'admin';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Family Workspace Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Workspace administration, preferences, and security controls.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Family Workspace Name
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500"
            />
            {!isAdmin && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Only the Family Admin can rename the workspace.</p>
            )}
          </div>

          {isAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Workspace Name'}</span>
              </button>
            </div>
          )}
        </form>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Invitation Code</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share this private code with your immediate family members so they can join your household workspace.
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {family?.invite_code}
            </span>
            <button
              onClick={() => {
                if (family?.invite_code) {
                  navigator.clipboard.writeText(family.invite_code);
                  setCopied(true);
                  success('Code copied!');
                  setTimeout(() => setCopied(false), 3000);
                }
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Data Privacy & Encryption</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All document uploads in this workspace are restricted exclusively to authenticated family members. Zero analytics or advertising trackers are active.
          </p>
        </div>
      </div>
    </div>
  );
}

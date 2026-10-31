import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ShieldCheck, PlusCircle, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';

export default function FamilySetupPage() {
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [familyName, setFamilyName] = useState('');
  const [relationship, setRelationship] = useState('Head of Family');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) {
      error('Please enter a family name (e.g. Sharma Family).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createFamily({ family_name: familyName, relationship });
      if (res.success) {
        success(`Family workspace "${familyName}" created!`);
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.message || 'Failed to create family.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      error('Please enter the family invite code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.joinFamily({ invite_code: inviteCode, relationship });
      if (res.success) {
        success(`Joined ${res.family.family_name}!`);
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.message || 'Failed to join family workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">GharSahayak</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Set up your Family Workspace</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose whether to create a new household or join your family.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Toggle Pills */}
        <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'create'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Create a Family</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'join'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Join Existing Family</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {mode === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Family Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Singh Family or Sharma Household"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">You will be designated as the Family Admin with full management permissions.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Role in Family
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white dark:bg-slate-900"
                >
                  <option value="Head of Family">Head of Family</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <span>{loading ? 'Creating...' : 'Initialize Family Workspace'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Family Invite Code *
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SINGH-786"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono tracking-wider uppercase text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Ask your Family Admin for their 6-character family workspace invite code.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Relationship in Family
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white dark:bg-slate-900"
                >
                  <option value="Member">Family Member</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Spouse">Spouse</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <span>{loading ? 'Joining...' : 'Join Family Workspace'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

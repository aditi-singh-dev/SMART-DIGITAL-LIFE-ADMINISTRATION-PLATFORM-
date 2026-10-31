import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  ShieldCheck, 
  MoreVertical, 
  Trash2, 
  Files, 
  CheckSquare,
  KeyRound
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function FamilyMembersPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const res = await api.getFamily();
      if (res.success) {
        setFamily(res.family);
      }
    } catch (e) {
      error('Failed to load family members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleCopyCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      setCopied(true);
      success('Family Invite Code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this family workspace?`)) {
      return;
    }
    try {
      const res = await api.removeMember(memberUserId);
      if (res.success) {
        success(res.message);
        fetchFamily();
      }
    } catch (err) {
      error(err.message || 'Could not remove member.');
    }
  };

  const handleChangeRole = async (memberUserId, newRole) => {
    try {
      const res = await api.changeMemberRole(memberUserId, newRole);
      if (res.success) {
        success('Member role updated.');
        fetchFamily();
      }
    } catch (err) {
      error(err.message || 'Could not update role.');
    }
  };

  if (loading || !family) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading family members...</div>;
  }

  const isAdmin = user?.familyRole === 'admin';
  const members = family.members || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Family Members</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage profiles, roles, and shared permissions for {family.family_name}.
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.2]" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Invite Code Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Workspace Invite Code</span>
            <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-widest">{family.invite_code}</span>
          </div>
        </div>

        <button
          onClick={handleCopyCode}
          className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Code Copied' : 'Copy Invite Code'}</span>
        </button>
      </div>

      {/* Members Grid (Section 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const isCurrent = m.user_id === user?.id;
          return (
            <div
              key={m.user_id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  {/* Initials Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-extrabold shadow-sm"
                    style={{ backgroundColor: m.avatar_color || '#4F46E5' }}
                  >
                    {m.full_name?.substring(0, 2).toUpperCase()}
                  </div>

                  {m.role === 'admin' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Family Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Member
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{m.full_name}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{m.relationship || 'Member'}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{m.email}</p>
                </div>

                {/* Document & Task Counts */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Documents</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{m.document_count || 0}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Active Tasks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{m.active_task_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && !isCurrent && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m.user_id, e.target.value)}
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-transparent border-0 focus:ring-0 cursor-pointer"
                  >
                    <option value="member" className="dark:bg-slate-900">Member</option>
                    <option value="admin" className="dark:bg-slate-900">Admin</option>
                  </select>

                  <button
                    onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 p-1 text-[11px] font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <Modal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite Family Member"
          subtitle={`Add parents, siblings, or spouse to ${family.family_name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Family members can join using your unique family invite code during registration.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Share this code:</span>
              <p className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest">{family.invite_code}</p>
              <button
                onClick={handleCopyCode}
                className="mt-2 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Instructions for family member:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Visit GharSahayak and click "Get Started"</li>
                <li>Register their personal name and email</li>
                <li>Select "Join Existing Family" and paste code <b>{family.invite_code}</b></li>
              </ol>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

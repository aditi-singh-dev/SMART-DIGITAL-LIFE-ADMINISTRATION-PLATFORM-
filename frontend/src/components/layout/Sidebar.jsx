import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Files, 
  Clock, 
  CheckSquare, 
  Calendar, 
  Users, 
  History, 
  Settings, 
  LogOut,
  FolderKanban,
  ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNav = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', to: '/vault', icon: Files },
    { name: 'Deadlines', to: '/expiry', icon: Clock },
    { name: 'Workflows', to: '/workflows', icon: FolderKanban },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Calendar', to: '/calendar', icon: Calendar },
  ];

  const familyNav = [
    { name: 'Family Members', to: '/family/members', icon: Users },
    { name: 'Activity', to: '/activity', icon: History },
  ];

  const systemNav = [
    { name: 'Settings', to: '/family/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#172554] dark:bg-indigo-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400 dark:text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#172554] dark:text-white">GharSahayak</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase -mt-0.5">Family Administration</span>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {/* MAIN */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Main
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#172554] dark:text-indigo-400 font-semibold shadow-2xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                    `}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* FAMILY */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Family
            </div>
            <nav className="space-y-1">
              {familyNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#172554] dark:text-indigo-400 font-semibold shadow-2xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                    `}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* SYSTEM */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              System
            </div>
            <nav className="space-y-1">
              {systemNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#172554] dark:text-indigo-400 font-semibold shadow-2xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                    `}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Family Workspace Pill */}
        {user?.familyName && (
          <div className="px-4 py-2.5 mx-4 mb-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Workspace</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user.familyName}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold uppercase border border-indigo-200/50 dark:border-indigo-800/50">
              {user.familyRole}
            </span>
          </div>
        )}

        {/* Emergency Kit Trigger & Theme Switcher */}
        <div className="px-4 pb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open:emergencykit'));
              onClose?.();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Emergency Kit</span>
            <span className="text-[9px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1 py-0.2 rounded font-extrabold">SOS</span>
          </button>
          <ThemeToggle compact={true} />
        </div>

        {/* User Profile Bar at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div 
            onClick={() => { navigate('/profile'); onClose?.(); }}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-2xs"
              style={{ backgroundColor: user?.avatar_color || '#4F46E5' }}
            >
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                {user?.familyRole === 'admin' ? 'Family Admin' : (user?.relationship || 'Family Member')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

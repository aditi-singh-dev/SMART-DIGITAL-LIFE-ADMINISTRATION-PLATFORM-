import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Bell, 
  Menu, 
  FileUp, 
  CheckSquare, 
  FolderPlus, 
  User, 
  Settings, 
  LogOut,
  ShieldAlert,
  Users2
} from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function TopNav({ onOpenSidebar, onOpenSearch, onOpenNotifications, onOpenEmergencyKit, onQuickAdd, unreadCount = 0 }) {
  const { user, login, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const addMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchPersona = async (email, personaName) => {
    setShowUserMenu(false);
    try {
      const res = await api.login({ email, password: 'password123' });
      if (res.success) {
        login(res.token, res.user);
        success(`Switched active view to ${personaName}`);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile hamburger & Global Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger bar */}
        <div 
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all text-slate-400 group max-w-md shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Search documents, tasks, workflows...</span>
          <span className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emergency SOS Kit Button */}
        <button
          type="button"
          onClick={onOpenEmergencyKit}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex-shrink-0"
          title="Emergency Medical & Vital ID Kit"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
          <span className="hidden md:inline">Emergency Kit</span>
          <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1.5 py-0.2 rounded font-extrabold uppercase">SOS</span>
        </button>

        {/* Quick Add Button */}
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172554] dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Quick Add Dropdown Menu */}
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { setShowAddMenu(false); onQuickAdd('upload_document'); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={() => { setShowAddMenu(false); onQuickAdd('create_task'); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => { setShowAddMenu(false); onQuickAdd('create_workflow'); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Create Workflow</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <ThemeToggle compact={true} />

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* User Avatar Menu with Client Demo Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-transform active:scale-95"
            style={{ backgroundColor: user?.avatar_color || '#4F46E5' }}
          >
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'U'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                  {user?.familyRole === 'admin' ? 'Family Admin' : 'Family Member'}
                </span>
              </div>

              {/* Demo Persona Switcher */}
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Switch Demo Member
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSwitchPersona('aditi@singhfamily.in', 'Aditi (Admin)')}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      user?.email === 'aditi@singhfamily.in' 
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>👑 Aditi Singh (Admin)</span>
                    {user?.email === 'aditi@singhfamily.in' && <span className="text-[10px]">Active</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchPersona('rajesh@singhfamily.in', 'Rajesh (Adult)')}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      user?.email === 'rajesh@singhfamily.in' 
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>👨 Rajesh Singh (Adult)</span>
                    {user?.email === 'rajesh@singhfamily.in' && <span className="text-[10px]">Active</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchPersona('priya@singhfamily.in', 'Priya (Student)')}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      user?.email === 'priya@singhfamily.in' 
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🎓 Priya Singh (Student)</span>
                    {user?.email === 'priya@singhfamily.in' && <span className="text-[10px]">Active</span>}
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/family/settings'); }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Family Settings</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              <button
                onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

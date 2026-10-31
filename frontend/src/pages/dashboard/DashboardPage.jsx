import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Files, 
  Clock, 
  CheckSquare, 
  Users, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileUp,
  FolderPlus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import HealthScoreModal from '../../components/common/HealthScoreModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthModalOpen, setHealthModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardSummary();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error('Dashboard load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const handleRefresh = () => fetchDashboard();
    window.addEventListener('refresh:dashboard', handleRefresh);
    return () => window.removeEventListener('refresh:dashboard', handleRefresh);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalDocuments: 0,
    expiringSoon: 0,
    upcomingDeadlines: 0,
    pendingTasks: 0,
    totalFamilyMembers: 1
  };

  const actionRequired = data?.actionRequired || [];
  const health = data?.health || { score: 100, status: 'GOOD', message: 'All parameters normal' };
  const charts = data?.charts || { categoryBreakdown: [], expiryTimeline: [] };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Family Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here's what needs your attention today across the {user?.familyName || 'Family'} workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Emergency Kit Quick Access */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open:emergencykit'))}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 rounded-2xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Emergency Kit</span>
            <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1.5 py-0.2 rounded font-extrabold uppercase">SOS</span>
          </button>

          {/* Quick Expiry Alert Badge */}
          {summary.expiringSoon > 0 && (
            <div 
              onClick={() => navigate('/expiry')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-amber-900 dark:text-amber-200 text-xs font-bold cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/70 transition-all shadow-2xs flex-shrink-0"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-bounce" />
              <span>{summary.expiringSoon} document{summary.expiringSoon > 1 ? 's' : ''} expiring soon</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500 ml-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* 4 Compact Statistics Cards with Trend & Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Documents */}
        <div 
          onClick={() => navigate('/vault')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Documents</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{summary.totalDocuments}</div>
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            <span>●</span>
            <span>{summary.expiringSoon > 0 ? `${summary.expiringSoon} expiring soon` : 'All records valid'}</span>
          </div>
        </div>

        {/* Card 2: Deadlines */}
        <div 
          onClick={() => navigate('/expiry')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Deadlines</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary.upcomingDeadlines < 10 ? `0${summary.upcomingDeadlines}` : summary.upcomingDeadlines}
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            Renewals & due dates
          </p>
        </div>

        {/* Card 3: Tasks */}
        <div 
          onClick={() => navigate('/tasks')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {(summary.pendingTasks + summary.completedTasks) < 10 ? `0${summary.pendingTasks + summary.completedTasks}` : summary.pendingTasks + summary.completedTasks}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{summary.pendingTasks} pending</span> · {summary.completedTasks} done
          </p>
        </div>

        {/* Card 4: Family Members */}
        <div 
          onClick={() => navigate('/family/members')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Family</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary.totalFamilyMembers < 10 ? `0${summary.totalFamilyMembers}` : summary.totalFamilyMembers}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            4 active profiles
          </p>
        </div>
      </div>

      {/* Main Grid: Action Required (Left 2/3) + Family Admin Health (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACTION REQUIRED SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Action Required
                </h3>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {actionRequired.length} urgent tasks & renewals
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {actionRequired.length > 0 ? (
                actionRequired.map((item) => (
                  <div 
                    key={item.id} 
                    className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 -mx-2 px-3 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgency === 'urgent'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : item.urgency === 'high'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                    </div>

                    <button
                      onClick={() => navigate(item.link)}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#172554] dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-2xs"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  Great job! No urgent actions are required right now.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Prioritized by expiration urgency and due dates</span>
            <button 
              onClick={() => navigate('/expiry')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              View Full Timeline →
            </button>
          </div>
        </div>

        {/* FAMILY ADMINISTRATION HEALTH CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Family Admin Health
              </h3>
              <button
                onClick={() => setHealthModalOpen(true)}
                title="View scoring logic"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Score Ring Display */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      health.score >= 90 ? 'text-emerald-500' :
                      health.score >= 75 ? 'text-indigo-600 dark:text-indigo-400' :
                      health.score >= 55 ? 'text-amber-500' : 'text-rose-500'
                    }
                    strokeDasharray={`${health.score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-[#172554] dark:text-white tracking-tight">{health.score}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 -mt-1 font-bold">/ 100</span>
                </div>
              </div>

              <div className="mt-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  health.score >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  health.score >= 75 ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                  health.score >= 55 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                  'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {health.status}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">{health.message}</p>
              </div>
            </div>

            {/* Health Warnings / Bullet points */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              {health.warnings && health.warnings.slice(0, 3).map((w, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="truncate">{w}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setHealthModalOpen(true)}
            className="w-full mt-4 py-2.5 text-xs font-bold text-[#172554] dark:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            How is this score calculated? →
          </button>
        </div>
      </div>

      {/* Analytics & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Documents by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Documents by Category
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Distribution across Indian household document types</p>
            </div>
            <button 
              onClick={() => navigate('/vault')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Open Vault →
            </button>
          </div>

          <div className="h-60 w-full">
            {charts.categoryBreakdown && charts.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F172A' : '#172554', 
                      borderColor: isDark ? '#334155' : '#1E293B',
                      color: '#fff', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorized documents yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Upcoming Expirations Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Expiry Schedule
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Renewals scheduled over upcoming months</p>
            </div>
            <button 
              onClick={() => navigate('/calendar')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Calendar View →
            </button>
          </div>

          <div className="h-60 w-full">
            {charts.expiryTimeline && charts.expiryTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.expiryTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F172A' : '#172554', 
                      borderColor: isDark ? '#334155' : '#1E293B',
                      color: '#fff', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expirations logged for upcoming months.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Score Calculation Modal */}
      <HealthScoreModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        health={health}
      />
    </div>
  );
}

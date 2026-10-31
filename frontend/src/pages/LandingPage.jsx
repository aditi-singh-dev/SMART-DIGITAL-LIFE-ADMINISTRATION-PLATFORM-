import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Files, 
  Clock, 
  FolderKanban, 
  CheckSquare, 
  ArrowRight, 
  Lock, 
  Users, 
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">GharSahayak</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Digital Life Administration Platform for Indian Families</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
          Your family's important paperwork, <br className="hidden sm:inline" />
          <span className="text-indigo-600 dark:text-indigo-400">finally under control.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Organize documents, track deadlines, manage renewals, and distribute everyday administrative responsibilities from one secure, private family workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started with GharSahayak</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold transition-colors"
          >
            See How It Works
          </a>
        </div>

        {/* Demo Credentials Pill */}
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Instant Demo:</span>
          <span>Login as <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded">aditi@singhfamily.in</code> with password <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded">password123</code></span>
        </div>
      </section>

      {/* Realistic Product UI Preview */}
      <section className="px-6 max-w-6xl mx-auto pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-6 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              gharsahayak.in/dashboard
            </div>
            <div className="w-12"></div>
          </div>

          {/* Mock Dashboard Preview Content */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Good morning, Aditi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Here's what needs your attention today across the Singh Family workspace.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span>Family Admin Health: 85/100 · Good</span>
              </div>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Documents</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">28</p>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">3 expiring soon</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Deadlines</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">06</p>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">2 this week</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Tasks</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">08</p>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">3 pending</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Family</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">04</p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">active members</span>
              </div>
            </div>

            {/* Mock Action Required Row */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Action Required</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">View All (3) →</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Vehicle Insurance (Hyundai Creta)</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Expires in 8 days · ICICI Lombard</p>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold rounded border border-rose-200 dark:border-rose-900">
                    Review Renewal →
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Scholarship Application</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Readiness: 67% (4 of 6 documents ready)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded border border-indigo-200 dark:border-indigo-800">
                    Continue Checklist →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Core Architecture</h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Everything important. One place.</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Designed specifically for the multi-member, document-heavy administrative needs of Indian households.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Files className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Smart Document Vault</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Centralize Aadhaar, PAN, insurance policies, marksheets, property deeds, and vehicle RCs with intelligent auto-categorization.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Deadline & Expiry Tracker</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Visual timeline tracking 7-day, 30-day, and 90-day renewals with proactive reminders so critical policies never lapse.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <FolderKanban className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Administrative Workflows</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pre-built checklists for college admissions, scholarship applications, and passport renewals. Instant Readiness Percentage scores.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckSquare className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Family Task Sharing</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Assign tasks to parents, siblings, or children with priorities and due dates. Stop relying on one person to remember everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 border-t border-slate-800 text-white px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Private, isolated, and encrypted.</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
              Your family's identity records, financial papers, and property documents are accessible only to authorized members within your private workspace.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AES-256 Storage</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Granular Role Controls</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Advertising</span>
            </div>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
          >
            Create Your Family Workspace →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">GharSahayak</span>
            <span>· Smart Digital Life Administration</span>
          </div>
          <p>© 2026 GharSahayak. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

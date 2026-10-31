import React, { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  PieChart, 
  ChevronRight, 
  ShieldCheck, 
  Car, 
  HeartPulse, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function RenewalCostTracker() {
  const [activeTab, setActiveTab] = useState('all');

  const renewalItems = [
    {
      title: 'Maruti Brezza Comprehensive Policy (ICICI Lombard)',
      category: 'Vehicle',
      icon: Car,
      amount: 14500,
      dueDate: 'In 8 days (05 Nov 2026)',
      urgency: 'critical',
      member: 'Rajesh Singh',
      frequency: 'Annual'
    },
    {
      title: 'Star Health Comprehensive Family Floater (₹15 Lakh Cover)',
      category: 'Health',
      icon: HeartPulse,
      amount: 22000,
      dueDate: 'In 24 days (21 Nov 2026)',
      urgency: 'high',
      member: 'Family Floater (4 Members)',
      frequency: 'Annual'
    },
    {
      title: 'HDFC Life Click2Protect 3D Plus (₹1 Crore Term Cover)',
      category: 'Life',
      icon: ShieldCheck,
      amount: 18000,
      dueDate: 'In 68 days (05 Jan 2027)',
      urgency: 'upcoming',
      member: 'Rajesh Singh',
      frequency: 'Annual'
    },
    {
      title: 'Municipal Property Tax & Water Cess (Noida Authority B-402)',
      category: 'Statutory',
      icon: FileText,
      amount: 4200,
      dueDate: 'In 85 days (22 Jan 2027)',
      urgency: 'upcoming',
      member: 'Aditi Singh',
      frequency: 'Annual'
    }
  ];

  const filteredItems = activeTab === 'all' 
    ? renewalItems 
    : renewalItems.filter(item => item.category.toLowerCase() === activeTab.toLowerCase());

  const total30Days = 14500 + 22000; // 36,500
  const total90Days = 14500 + 22000 + 18000 + 4200; // 58,700

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <IndianRupee className="w-3 h-3" />
            <span>Household Liquidity & Cashflow Guard</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Upcoming Renewal Cost & Premium Forecast</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan household funds in advance so insurance policies and statutory registrations never lapse due to unexpected payments.
          </p>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-right">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Due Next 30 Days</span>
            <span className="text-base font-extrabold text-amber-900 dark:text-amber-200 font-mono">₹{total30Days.toLocaleString('en-IN')}</span>
          </div>
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-right">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">Total Next 90 Days</span>
            <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-200 font-mono">₹{total90Days.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        {['all', 'vehicle', 'health', 'life', 'statutory'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'all' ? 'All Renewals (4)' : tab}
          </button>
        ))}
      </div>

      {/* Renewal Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.urgency === 'critical' 
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : item.urgency === 'high'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{item.member}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.dueDate}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-semibold">
                      {item.frequency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <div className={`text-[10px] font-bold uppercase ${
                    item.urgency === 'critical' ? 'text-rose-600 dark:text-rose-400' :
                    item.urgency === 'high' ? 'text-amber-600 dark:text-amber-400' :
                    'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {item.urgency === 'critical' ? 'Action Required' : item.urgency === 'high' ? 'Due Soon' : 'Upcoming'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

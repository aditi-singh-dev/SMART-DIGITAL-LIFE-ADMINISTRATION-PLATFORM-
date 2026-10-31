import React from 'react';
import Modal from './Modal';
import { ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function HealthScoreModal({ isOpen, onClose, health }) {
  if (!health) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Family Administration Health Score"
      subtitle="How your family administration score is calculated"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Score Header */}
        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overall Status</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-[#172554] dark:text-white">{health.score}</span>
              <span className="text-sm text-slate-400 dark:text-slate-500">/ 100</span>
              <span className={`ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                health.score >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                health.score >= 75 ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                health.score >= 55 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {health.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{health.message}</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[#172554] dark:border-indigo-500 flex items-center justify-center font-black text-lg text-[#172554] dark:text-indigo-300 bg-white dark:bg-slate-900 shadow-sm">
            {health.score}%
          </div>
        </div>

        {/* Transparent Calculation Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Deterministic Scoring Model
          </h4>
          <div className="space-y-2">
            {health.breakdown && health.breakdown.length > 0 ? (
              health.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 text-xs">
                  <div>
                    <span className="font-semibold text-rose-900 dark:text-rose-300">{item.factor}</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 shadow-2xs">
                    {item.impact}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No deductions applied. All parameters are optimal!</p>
            )}
          </div>
        </div>

        {/* Positive Factors */}
        {health.positives && health.positives.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Maintained Safeguards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {health.positives.map((pos, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{pos}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules explanation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Scoring Guidelines:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-500 dark:text-slate-400">
            <li>Base score begins at 100 points</li>
            <li>Expired documents deduct 15 points each</li>
            <li>Documents expiring in under 7 days deduct 5 points</li>
            <li>Overdue tasks deduct 10 points each</li>
            <li>Pending urgent tasks deduct 5 points</li>
            <li>Incomplete workflows nearing deadline deduct 5-10 points</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

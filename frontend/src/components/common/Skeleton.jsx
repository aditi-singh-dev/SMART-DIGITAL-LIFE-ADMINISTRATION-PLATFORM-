import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

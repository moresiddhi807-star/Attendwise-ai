import React from 'react';

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
          <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full w-16" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16" />
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg w-28" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-card p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

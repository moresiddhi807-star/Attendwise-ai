import React from 'react';

export default function StatCard({ icon, label, value, subtitle, color = 'purple', trend }) {
  const colors = {
    purple: 'from-primary-500 to-secondary',
    green: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    red: 'from-red-500 to-rose-400',
    blue: 'from-blue-500 to-indigo-400',
  };

  return (
    <div className="glass-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-300">
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white text-xl shrink-0 shadow-glass`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

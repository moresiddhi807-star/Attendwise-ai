import React, { useState } from 'react';
import { calcSafeBunks, calcLecturesNeeded } from '../utils/attendance';

export default function BunkCalculator() {
  const [form, setForm] = useState({ attended: '', total: '', required: '75' });
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const attended = parseInt(form.attended);
    const total = parseInt(form.total);
    const required = parseFloat(form.required);

    if (isNaN(attended) || isNaN(total) || total <= 0) return;
    if (attended > total) { alert('Attended cannot exceed total'); return; }

    const currentPct = (attended / total) * 100;
    const safeBunks = calcSafeBunks(attended, total, required);
    const needed = calcLecturesNeeded(attended, total, required);

    setResult({
      currentPct: currentPct.toFixed(1),
      safeBunks,
      needed,
      canBunk: currentPct >= required,
      attended,
      total,
      required,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🧮 Bunk Calculator</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Find out exactly how many classes you can safely skip</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={calculate} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Classes Attended</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={form.attended}
                onChange={e => setForm(p => ({ ...p, attended: e.target.value }))}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Classes</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={form.total}
                onChange={e => setForm(p => ({ ...p, total: e.target.value }))}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Required Attendance % <span className="text-primary-500">(default 75%)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="60"
                max="90"
                step="5"
                value={form.required}
                onChange={e => setForm(p => ({ ...p, required: e.target.value }))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 w-12 text-right">{form.required}%</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              {['60%', '65%', '70%', '75%', '80%', '85%', '90%'].map(v => <span key={v}>{v}</span>)}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base">
            🧮 Calculate
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`glass-card p-8 border-2 ${result.canBunk && result.safeBunks > 0 ? 'border-emerald-200 dark:border-emerald-800' : result.canBunk ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800'} animate-slide-up`}>
          <div className="text-center mb-6">
            <div className={`text-6xl font-extrabold mb-2 ${result.canBunk && result.safeBunks > 0 ? 'text-emerald-500' : result.canBunk ? 'text-amber-500' : 'text-red-500'}`}>
              {result.canBunk && result.safeBunks > 0
                ? result.safeBunks
                : result.canBunk
                ? '0'
                : result.needed}
            </div>
            <p className={`text-xl font-bold ${result.canBunk && result.safeBunks > 0 ? 'text-emerald-600' : result.canBunk ? 'text-amber-600' : 'text-red-600'}`}>
              {result.canBunk && result.safeBunks > 0
                ? `lecture${result.safeBunks !== 1 ? 's' : ''} you can safely miss`
                : result.canBunk
                ? 'lectures you can miss (at limit!)'
                : `consecutive lectures you must attend`}
            </p>
          </div>

          <div className={`p-4 rounded-xl text-center mb-6 ${result.canBunk && result.safeBunks > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : result.canBunk ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <p className={`font-semibold text-lg ${result.canBunk && result.safeBunks > 0 ? 'text-emerald-700 dark:text-emerald-400' : result.canBunk ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
              {result.canBunk && result.safeBunks > 0
                ? `✅ You can safely miss ${result.safeBunks} lecture${result.safeBunks !== 1 ? 's' : ''}.`
                : result.canBunk
                ? '⚠️ You are exactly at the threshold. Don\'t miss any class!'
                : `❌ Attend next ${result.needed} lectures without missing.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{result.currentPct}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">Attended</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{result.attended}/{result.total}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">Required</p>
              <p className="text-xl font-bold text-primary-600">{result.required}%</p>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">📐 How it's calculated</h3>
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p>• <strong className="text-slate-700 dark:text-slate-300">Safe bunks</strong> = floor(attended − required% × total)</p>
          <p>• <strong className="text-slate-700 dark:text-slate-300">Lectures needed</strong> = ceil((required% × total − attended) ÷ (1 − required%))</p>
          <p>• Default required attendance is <strong className="text-primary-500">75%</strong> (most Indian universities)</p>
        </div>
      </div>
    </div>
  );
}

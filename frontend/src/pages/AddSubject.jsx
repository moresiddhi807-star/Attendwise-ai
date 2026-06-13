import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SAMPLE_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'DBMS', 'Operating Systems', 'Data Structures', 'Algorithms', 'Software Engineering', 'Networks'];

export default function AddSubject() {
  const [form, setForm] = useState({ subjectName: '', attendedClasses: '', totalClasses: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pct = form.totalClasses > 0 ? ((form.attendedClasses / form.totalClasses) * 100).toFixed(1) : null;
  const statusColor = pct >= 80 ? 'emerald' : pct >= 75 ? 'amber' : pct !== null ? 'red' : 'slate';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectName.trim()) { toast.error('Subject name is required'); return; }
    if (form.attendedClasses === '' || form.totalClasses === '') { toast.error('Please fill all fields'); return; }
    if (parseInt(form.attendedClasses) > parseInt(form.totalClasses)) {
      toast.error('Attended classes cannot exceed total classes');
      return;
    }
    setLoading(true);
    try {
      await api.post('/subjects', {
        subjectName: form.subjectName.trim(),
        attendedClasses: parseInt(form.attendedClasses),
        totalClasses: parseInt(form.totalClasses),
      });
      toast.success(`"${form.subjectName}" added successfully!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Subject</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Enter your subject details to start tracking attendance</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Data Structures, Physics..."
              value={form.subjectName}
              onChange={e => setForm(p => ({ ...p, subjectName: e.target.value }))}
              className="input-field"
              list="subject-suggestions"
              required
            />
            <datalist id="subject-suggestions">
              {SAMPLE_SUBJECTS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Attended Classes</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={form.attendedClasses}
                onChange={e => setForm(p => ({ ...p, attendedClasses: e.target.value }))}
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
                value={form.totalClasses}
                onChange={e => setForm(p => ({ ...p, totalClasses: e.target.value }))}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          {/* Live preview */}
          {pct !== null && (
            <div className={`p-4 rounded-xl border bg-${statusColor}-50 dark:bg-${statusColor}-900/20 border-${statusColor}-200 dark:border-${statusColor}-800`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Attendance</span>
                <span className={`text-xl font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>{pct}%</span>
              </div>
              <div className="h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-${statusColor}-400 transition-all duration-300`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className={`text-xs text-${statusColor}-600 dark:text-${statusColor}-400 mt-2 font-medium`}>
                {pct >= 80 ? '✅ Safe — great attendance!' : pct >= 75 ? '⚠️ Warning — close to threshold' : '🚨 Critical — below 75%!'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : '✅ Add Subject'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick add hints */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">💡 Quick Suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SUBJECTS.slice(0, 6).map(s => (
            <button
              key={s}
              onClick={() => setForm(p => ({ ...p, subjectName: s }))}
              className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-800 hover:bg-primary-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

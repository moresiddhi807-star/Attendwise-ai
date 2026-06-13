import React, { useState } from 'react';
import { getAttendanceStatus } from '../../utils/attendance';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SubjectCard({ subject, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [attended, setAttended] = useState(subject.attendedClasses);
  const [total, setTotal] = useState(subject.totalClasses);
  const [saving, setSaving] = useState(false);

  const status = getAttendanceStatus(subject.attendancePercentage);
  const pct = subject.attendancePercentage;
  console.log(subject);

  const handleSave = async () => {
    if (parseInt(attended) > parseInt(total)) {
      toast.error('Attended cannot exceed total');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/subjects/${subject._id}`, {
        subjectName: subject.subjectName,
        attendedClasses: parseInt(attended),
        totalClasses: parseInt(total),
      });
      toast.success('Updated!');
      setEditing(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${subject.subjectName}"?`)) return;
    try {
      await api.delete(`/subjects/${subject._id}`);
      toast.success('Subject deleted');
      onDelete?.();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className={`glass-card p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 border ${status.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base leading-tight">{subject.subjectName}</h3>
          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
            {status.label}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${status.text}`}>{(pct ?? 0).toFixed(1)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full progress-bar ${
            (pct ?? 0) >= 80
  ? 'bg-emerald-400'
  : (pct ?? 0) >= 75
  ? 'bg-amber-400'
  : 'bg-red-400'
          }`}
          style={{ width: `${Math.min(100, pct ?? 0)}%` }}
        />
      </div>

      {/* Stats */}
      {editing ? (
        <div className="space-y-2 mb-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">Attended</label>
              <input
                type="number"
                value={attended}
                onChange={e => setAttended(e.target.value)}
                className="input-field text-sm py-1.5 mt-0.5"
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">Total</label>
              <input
                type="number"
                value={total}
                onChange={e => setTotal(e.target.value)}
                className="input-field text-sm py-1.5 mt-0.5"
                min="1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5 px-4 flex-1">
              {saving ? '...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5 px-4 flex-1">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-slate-500 dark:text-slate-400">
            {subject.attendedClasses} / {subject.totalClasses} classes
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-xs">
            {subject.totalClasses - subject.attendedClasses} missed
          </span>
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-xs text-primary-600 hover:text-primary-700 font-medium py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 text-xs text-red-500 hover:text-red-600 font-medium py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

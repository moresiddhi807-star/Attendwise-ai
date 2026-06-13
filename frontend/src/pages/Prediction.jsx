import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Prediction() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [futureLectures, setFutureLectures] = useState(10);
  const [plannedBunks, setPlannedBunks] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  api.get('/subjects').then(({ data }) => {
    const formattedSubjects = (data.subjects || []).map(s => ({
      ...s,
      _id: s.id,
      subjectName: s.subject_name,
      attendedClasses: s.attended_classes,
      totalClasses: s.total_classes,
      attendancePercentage: parseFloat(s.attendance_percentage)
    }));

    setSubjects(formattedSubjects);

    if (formattedSubjects.length > 0) {
      setSelectedSubject(formattedSubjects[0]._id);
    }
  }).catch(() => toast.error('Failed to load subjects'));
}, []);

  const subject = subjects.find(s => s._id === selectedSubject);
  console.log(JSON.stringify(subjects, null, 2));

  const handlePredict = async () => {
    if (!selectedSubject) { toast.error('Select a subject'); return; }
    if (parseInt(plannedBunks) > parseInt(futureLectures)) {
      toast.error('Planned bunks cannot exceed future lectures');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/predict', {
        subjectId: selectedSubject,
        futureLectures: parseInt(futureLectures),
        plannedBunks: parseInt(plannedBunks),
      });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { SAFE: '#10B981', WARNING: '#F59E0B', CRITICAL: '#EF4444' };
  const statusBgs = { SAFE: 'bg-emerald-50 border-emerald-200 text-emerald-700', WARNING: 'bg-amber-50 border-amber-200 text-amber-700', CRITICAL: 'bg-red-50 border-red-200 text-red-700' };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🔮 Attendance Prediction</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Forecast your attendance based on planned future lectures</p>
      </div>

      <div className="glass-card p-8 space-y-5">
        {/* Subject Select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Subject</label>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-400">No subjects added yet. <a href="/subjects/add" className="text-primary-500">Add one →</a></p>
          ) : (
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.subjectName} ({s.attendancePercentage}% — {s.attendedClasses}/{s.totalClasses})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Current info */}
        {subject && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Current</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{subject.attendancePercentage}%</p>
            </div>
            <div className="flex-1 h-px bg-primary-200 dark:bg-primary-700" />
            <p className="text-sm text-primary-600 dark:text-primary-400">{subject.attendedClasses}/{subject.totalClasses} lectures</p>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Future Lectures Expected
            </label>
            <input
              type="number"
              value={futureLectures}
              onChange={e => setFutureLectures(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Planned Bunks
            </label>
            <input
              type="number"
              value={plannedBunks}
              onChange={e => setPlannedBunks(Math.max(0, Math.min(futureLectures, parseInt(e.target.value) || 0)))}
              className="input-field"
              min="0"
              max={futureLectures}
            />
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading || subjects.length === 0}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Predicting...</> : '🔮 Predict Attendance'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white">Prediction Result</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBgs[result.status]}`}>
                {result.status}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current</p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{result.currentPercentage}%</p>
              </div>
              <div className="text-3xl">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Predicted</p>
                <p className="text-4xl font-extrabold" style={{ color: statusColors[result.status] }}>
                  {result.predictedPercentage}%
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-sm text-center font-medium ${statusBgs[result.status]}`}>
              {result.statusMessage}
            </div>
          </div>

          {/* Chart */}
          {result.projection && result.projection.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 text-sm">Attendance Projection Graph</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={result.projection} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="lecture" label={{ value: 'Future Lectures', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }} tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
                  <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="5 5" label={{ value: '75% Required', fontSize: 10, fill: '#EF4444' }} />
                  <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: '80% Safe', fontSize: 10, fill: '#F59E0B' }} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#6D5DFC"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#6D5DFC' }}
                    name="Attendance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

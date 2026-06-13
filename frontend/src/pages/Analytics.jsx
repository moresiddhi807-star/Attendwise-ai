import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, ReferenceLine,
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { SkeletonList } from '../components/ui/Skeleton';

const COLORS = ['#6D5DFC', '#8B7FFF', '#A78BFA', '#C4B5FD', '#DDD6FE'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}%</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
      </div>
      <SkeletonList count={3} />
    </div>
  );

  if (!data || data.subjectComparison.length === 0) return (
    <div className="max-w-5xl mx-auto">
      <div className="glass-card p-16 text-center">
        <span className="text-5xl mb-4 block">📈</span>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xl mb-2">No Data Yet</h3>
        <p className="text-slate-400 text-sm mb-6">Add subjects to see your analytics dashboard.</p>
        <a href="/subjects/add" className="btn-primary inline-flex">➕ Add Subjects</a>
      </div>
    </div>
  );

  const { overview, subjectComparison, riskAnalysis, trend, subjects } = data;
  const subjectColors = subjects?.reduce((acc, s, i) => ({ ...acc, [s.name]: COLORS[i % COLORS.length] }), {}) || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📈 Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Visual insights into your attendance performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Average', value: `${overview.average}%`, icon: '📊', bg: 'from-primary-500 to-secondary' },
          { label: 'Total Subjects', value: overview.total, icon: '📚', bg: 'from-blue-500 to-indigo-400' },
          { label: 'Safe Subjects', value: overview.safe, icon: '✅', bg: 'from-emerald-500 to-teal-400' },
          { label: 'Critical Subjects', value: overview.critical, icon: '🚨', bg: overview.critical > 0 ? 'from-red-500 to-rose-400' : 'from-slate-400 to-slate-300' },
        ].map(card => (
          <div key={card.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-11 h-11 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center text-white text-lg shrink-0 shadow-glass`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Comparison Bar Chart */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Subject Comparison</h2>
        <p className="text-xs text-slate-400 mb-5">Attendance percentage across all subjects</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={subjectComparison} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="5 5" strokeWidth={1.5} />
            <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={1.5} />
            <Bar dataKey="attendance" radius={[6, 6, 0, 0]} name="Attendance">
              {subjectComparison.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.attendance >= 80 ? '#10B981' : entry.attendance >= 75 ? '#F59E0B' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />Safe (≥80%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Warning (75–79%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Critical (&lt;75%)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Attendance Trend</h2>
          <p className="text-xs text-slate-400 mb-5">Simulated weekly trend per subject</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />
              {subjects?.map((s, i) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {subjects?.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Risk Analysis Pie */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Risk Analysis</h2>
          <p className="text-xs text-slate-400 mb-5">Distribution of subjects by risk level</p>
          {riskAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskAnalysis.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Subject Detail Table */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Subject Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium text-center">Attended</th>
                <th className="pb-3 font-medium text-center">Total</th>
                <th className="pb-3 font-medium text-center">Percentage</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {subjectComparison.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-300">{s.fullName}</td>
                  <td className="py-3 text-center text-slate-600 dark:text-slate-400">{s.attended}</td>
                  <td className="py-3 text-center text-slate-600 dark:text-slate-400">{s.total}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.attendance}%`,
                            background: s.attendance >= 80 ? '#10B981' : s.attendance >= 75 ? '#F59E0B' : '#EF4444',
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 w-12 text-right">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      s.status === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      s.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

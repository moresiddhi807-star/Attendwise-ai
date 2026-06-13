import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SubjectCard from '../components/ui/SubjectCard';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard, SkeletonStat } from '../components/ui/Skeleton';
import { exportCSV } from '../utils/attendance';

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects || []);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const safe = subjects.filter(s => s.attendancePercentage >= 80);
  const warning = subjects.filter(s => s.attendancePercentage >= 75 && s.attendancePercentage < 80);
  const critical = subjects.filter(s => s.attendancePercentage < 75);
  const overall = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + s.attendancePercentage, 0) / subjects.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Here's your attendance overview</p>
        </div>
        <div className="flex gap-2">
          {subjects.length > 0 && (
            <button
              onClick={() => { exportCSV(subjects, user?.name || 'student'); toast.success('CSV exported!'); }}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          )}
          <Link to="/subjects/add" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            ➕ Add Subject
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatCard icon="📊" label="Overall" value={`${overall}%`} color="purple" subtitle="Average attendance" />
            <StatCard icon="📚" label="Subjects" value={subjects.length} color="blue" subtitle="Total added" />
            <StatCard icon="✅" label="Safe" value={safe.length} color="green" subtitle="≥80% attendance" />
            <StatCard icon="🚨" label="At Risk" value={critical.length} color={critical.length > 0 ? 'red' : 'green'} subtitle="<75% attendance" />
          </>
        )}
      </div>

      {/* Alert for critical subjects */}
      {!loading && critical.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Immediate Action Required</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">
              <strong>{critical.map(s => s.subjectName).join(', ')}</strong> {critical.length === 1 ? 'is' : 'are'} below 75%. Attend classes immediately!
            </p>
          </div>
          <Link to="/ai-advisor" className="ml-auto text-xs font-medium text-red-600 dark:text-red-400 hover:underline whitespace-nowrap">
            Get AI Advice →
          </Link>
        </div>
      )}

      {/* Subject Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white text-lg">My Subjects</h2>
          {warning.length > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              ⚠️ {warning.length} in warning zone
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl mb-4 block">📚</span>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-lg mb-2">No Subjects Yet</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">Add your subjects to start tracking attendance and get AI insights.</p>
            <Link to="/subjects/add" className="btn-primary inline-flex items-center gap-2">
              ➕ Add Your First Subject
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(s => (
              <SubjectCard key={s._id} subject={s} onUpdate={fetchSubjects} onDelete={fetchSubjects} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      {subjects.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/bunk-calculator', icon: '🧮', title: 'Bunk Calculator', desc: 'Find safe bunks instantly' },
            { to: '/prediction', icon: '🔮', title: 'Attendance Prediction', desc: 'Forecast future attendance' },
            { to: '/ai-advisor', icon: '🤖', title: 'Ask AI Advisor', desc: 'Get personalized advice' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="glass-card p-5 flex items-center gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

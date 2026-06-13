import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🔮', title: 'Attendance Prediction', desc: 'Forecast your future attendance using ML-powered Linear Regression models.' },
  { icon: '🧮', title: 'Bunk Calculator', desc: 'Know exactly how many classes you can safely skip without falling below 75%.' },
  { icon: '🤖', title: 'AI Advisor', desc: 'Chat with your intelligent advisor for personalized attendance strategies.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Beautiful charts to visualize your attendance trends and risk analysis.' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes during late-night study sessions.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Export and download detailed attendance reports instantly.' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up free and set up your student profile in seconds.' },
  { step: '02', title: 'Add Subjects', desc: 'Enter your subjects with current attended and total class counts.' },
  { step: '03', title: 'Get Insights', desc: 'Receive AI-powered predictions, safe bunk counts, and smart advice.' },
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'Computer Science, 3rd Year', text: 'AttendWise saved my semester! I knew exactly when I could take a day off without risking my exams.', avatar: 'A' },
  { name: 'Priya Nair', role: 'Electronics Engineering', text: 'The AI advisor is incredible. It told me which subjects needed immediate attention before I even realized.', avatar: 'P' },
  { name: 'Rohan Mehta', role: 'MBA Student', text: 'Finally an app that understands student life. The bunk calculator is my go-to every morning!', avatar: 'R' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/60 dark:border-slate-700/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">AttendWise</span>
            <span className="text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-medium hidden sm:block">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-1.5">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary-100 dark:border-primary-800">
          🎓 Built for Students, Powered by AI
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white leading-tight mb-6">
          Never Worry About
          <span className="bg-gradient-to-r from-primary-500 to-accent bg-clip-text text-transparent"> Attendance </span>
          Again
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Predict your attendance, calculate safe bunks, and stay exam-eligible — all with AI-powered intelligence built for students.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base py-3 px-8 inline-flex items-center gap-2 justify-center">
            🚀 Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary text-base py-3 px-8 inline-flex items-center gap-2 justify-center">
            Login to Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[['10K+', 'Students'], ['95%', 'Accuracy'], ['100%', 'Free']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-primary-600">{val}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-slate-800 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Everything You Need</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">All the tools to manage your attendance smartly, in one beautiful dashboard.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-card transition-all duration-300 group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">How It Works</h2>
          <p className="text-slate-500 dark:text-slate-400">Three simple steps to never miss an exam eligibility deadline.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-2/3 w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
              )}
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent rounded-xl text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-glass">
                {s.step}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-primary-500 to-accent py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Loved by Students</h2>
            <p className="text-primary-100">Join thousands of students who never worry about attendance.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-primary-100 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Start Managing Your Attendance Today</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Free forever. No credit card required. Just smart attendance management.</p>
        <Link to="/register" className="btn-primary text-base py-3.5 px-10 inline-flex items-center gap-2">
          🎓 Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>© 2024 AttendWise AI. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  'What is my attendance status?',
  'Which subject needs focus?',
  'Can I bunk tomorrow?',
  'How many classes can I miss?',
  'What subjects are critical?',
  'Give me a recovery plan',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isUser ? 'bg-primary-500 text-white' : 'bg-gradient-to-br from-primary-400 to-accent text-white'}`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-primary-500 text-white rounded-tr-sm'
          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-600'
      }`}>
        {/* Render markdown-like bold */}
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1' : ''}>
            {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        ))}
        {msg.typing && <span className="inline-flex gap-1 ml-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></span>}
      </div>
    </div>
  );
}

export default function AIAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your AttendWise AI Advisor.\n\nI can help you with:\n- **Safe bunks** for specific subjects\n- **Recovery plans** for critical attendance\n- **Focus recommendations** based on your data\n\nWhat would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    // Show typing indicator
    setMessages(prev => [...prev, { role: 'assistant', content: '', typing: true }]);

    try {
      const { data } = await api.post('/advisor', { message: msg });
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: data.response },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: '❌ Sorry, I couldn\'t connect to the AI service. Please make sure all services are running.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center text-white text-xl">🤖</div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-white">AI Advisor</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            Powered by your attendance data
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="whitespace-nowrap text-xs px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shrink-0"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your attendance... (Enter to send)"
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent rounded-xl text-white flex items-center justify-center disabled:opacity-40 hover:shadow-glass transition-all shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

const express  = require('express');
const router   = express.Router();
const axios    = require('axios');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

router.use(protect);

// ── Local intelligent advice generator ─────────────────────
function generateAdvice(message, subjects) {
  const msg = message.toLowerCase();

  const critical = subjects.filter(s => s.attendance_percentage < 75);
  const warning  = subjects.filter(s => s.attendance_percentage >= 75 && s.attendance_percentage < 80);
  const safe     = subjects.filter(s => s.attendance_percentage >= 80);
  const avg      = subjects.reduce((sum, s) => sum + parseFloat(s.attendance_percentage), 0) / subjects.length;

  // Subject mentioned by name?
  const mentioned = subjects.find(s => msg.includes(s.subject_name.toLowerCase()));

  if (mentioned) {
    const pct      = parseFloat(mentioned.attendance_percentage);
    const canMiss  = Math.max(0, Math.floor(mentioned.attended_classes - 0.75 * mentioned.total_classes));
    const needs75  = Math.max(0, Math.ceil((0.75 * mentioned.total_classes - mentioned.attended_classes) / 0.25));

    if (msg.includes('bunk') || msg.includes('skip') || msg.includes('miss')) {
      if (pct >= 85)        return `✅ Yes! You can safely skip up to **${canMiss}** lecture(s) of **${mentioned.subject_name}** (currently ${pct}%) without dropping below 75%.`;
      else if (pct >= 80)   return `⚠️ You can skip **1** lecture of **${mentioned.subject_name}** (${pct}%), but don't push it further.`;
      else if (pct >= 75)   return `🚨 I'd strongly advise against skipping **${mentioned.subject_name}** — you're at ${pct}%, right on the edge!`;
      else                  return `❌ Do NOT skip **${mentioned.subject_name}**! You're at **${pct}%**. Attend the next **${needs75}** classes without missing any.`;
    }

    if (pct >= 80) return `📊 **${mentioned.subject_name}**: ✅ SAFE at **${pct}%** (${mentioned.attended_classes}/${mentioned.total_classes}). Keep it up!`;
    if (pct >= 75) return `📊 **${mentioned.subject_name}**: ⚠️ WARNING at **${pct}%**. Attend a few more to feel comfortable.`;
    return `📊 **${mentioned.subject_name}**: 🚨 CRITICAL at **${pct}%**. Attend next **${needs75}** classes to recover.`;
  }

  if (msg.includes('bunk') || msg.includes('skip')) {
    if (critical.length > 0) return `🚨 Don't skip anything! **${critical.map(s => s.subject_name).join(', ')}** is already below 75%.`;
    if (warning.length  > 0) return `⚠️ Be careful — **${warning.map(s => s.subject_name).join(', ')}** is in the warning zone. Only skip from subjects above 85%.`;
    const best = safe.sort((a, b) => b.attendance_percentage - a.attendance_percentage)[0];
    return `✅ All subjects look good! If you must skip, choose **${best?.subject_name}** (${best?.attendance_percentage}%) — it has the most buffer.`;
  }

  if (msg.includes('focus') || msg.includes('priority') || msg.includes('which')) {
    if (critical.length > 0) {
      const worst = critical.sort((a, b) => a.attendance_percentage - b.attendance_percentage)[0];
      const needs = Math.ceil((0.75 * worst.total_classes - worst.attended_classes) / 0.25);
      return `🎯 Focus on **${worst.subject_name}** — it's your most critical at **${worst.attendance_percentage}%**. Attend the next **${needs}** classes without missing.`;
    }
    if (warning.length > 0) return `⚠️ Pay attention to **${warning.map(s => `${s.subject_name} (${s.attendance_percentage}%)`).join(', ')}** — close to the boundary.`;
    return `🌟 All subjects are in great shape! Overall average is **${avg.toFixed(1)}%**. Keep it up!`;
  }

  if (msg.includes('status') || msg.includes('overview') || msg.includes('summary')) {
    return `📈 **Attendance Summary**\n\nOverall: **${avg.toFixed(1)}%**\n✅ Safe: ${safe.length} | ⚠️ Warning: ${warning.length} | 🚨 Critical: ${critical.length}`
      + (critical.length ? `\n\n🔴 Urgent: ${critical.map(s => s.subject_name).join(', ')}` : '');
  }

  const greetings = ['hi', 'hello', 'hey'];
  if (greetings.some(g => msg.includes(g))) {
    return `👋 Hey! Overall average: **${avg.toFixed(1)}%** | 🚨 Critical: ${critical.length} | ⚠️ Warning: ${warning.length} | ✅ Safe: ${safe.length}\n\nTry: "Can I bunk DBMS?" or "Which subject needs focus?"`;
  }

  return `🤖 You have **${subjects.length}** subjects, overall **${avg.toFixed(1)}%**.\n${critical.length ? `🚨 Urgent: **${critical.map(s => s.subject_name).join(', ')}**` : '✅ All subjects are in a safe zone.'}\n\nAsk me: "Can I bunk [subject]?" or "What's my status?"`;
}

// ── POST /api/advisor ───────────────────────────────────────
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE user_id = ?',
      [req.user.id]
    );

    if (subjects.length === 0)
      return res.json({ response: "📚 You haven't added any subjects yet! Go to Dashboard → Add Subject first, then I can give personalised advice." });

    // Try AI service
    try {
      const { data } = await axios.post(
        `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/advisor`,
        { message, subjects: subjects.map(s => ({ name: s.subject_name, attended: s.attended_classes, total: s.total_classes, percentage: parseFloat(s.attendance_percentage) })) },
        { timeout: 3000 }
      );
      return res.json({ response: data.response });
    } catch (_) { /* fallback */ }

    res.json({ response: generateAdvice(message, subjects) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating advice' });
  }
});

module.exports = router;

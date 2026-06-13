const express  = require('express');
const router   = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

router.use(protect);

// ── GET /api/analytics ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );

    if (subjects.length === 0) {
      return res.json({ overview: { total: 0, safe: 0, warning: 0, critical: 0, average: 0 }, subjectComparison: [], riskAnalysis: [], trend: [], subjects: [] });
    }

    const safe     = subjects.filter(s => parseFloat(s.attendance_percentage) >= 80);
    const warning  = subjects.filter(s => parseFloat(s.attendance_percentage) >= 75 && parseFloat(s.attendance_percentage) < 80);
    const critical = subjects.filter(s => parseFloat(s.attendance_percentage) < 75);
    const avg      = parseFloat((subjects.reduce((sum, s) => sum + parseFloat(s.attendance_percentage), 0) / subjects.length).toFixed(2));

    const subjectComparison = subjects.map(s => ({
      name:       s.subject_name.length > 12 ? s.subject_name.substring(0, 12) + '…' : s.subject_name,
      fullName:   s.subject_name,
      attendance: parseFloat(s.attendance_percentage),
      attended:   s.attended_classes,
      total:      s.total_classes,
      status:     parseFloat(s.attendance_percentage) >= 80 ? 'SAFE' : parseFloat(s.attendance_percentage) >= 75 ? 'WARNING' : 'CRITICAL',
    }));

    const riskAnalysis = [
      { name: 'Safe (≥80%)',    value: safe.length,     color: '#10B981' },
      { name: 'Warning (75–79%)', value: warning.length, color: '#F59E0B' },
      { name: 'Critical (<75%)', value: critical.length, color: '#EF4444' },
    ].filter(r => r.value > 0);

    // Simulate 7-week trend per subject
    const mergedTrend = [];
    for (let i = 0; i < 7; i++) {
      const week = { week: `Week ${i + 1}` };
      subjects.forEach(s => {
        const factor = 1 - ((6 - i) * 0.012);
        week[s.subject_name] = Math.min(100, Math.max(50, parseFloat((parseFloat(s.attendance_percentage) * factor).toFixed(1))));
      });
      mergedTrend.push(week);
    }

    const subjectMeta = subjects.map(s => ({
      name:  s.subject_name,
      color: parseFloat(s.attendance_percentage) >= 80 ? '#10B981' : parseFloat(s.attendance_percentage) >= 75 ? '#F59E0B' : '#EF4444',
    }));

    res.json({ overview: { total: subjects.length, safe: safe.length, warning: warning.length, critical: critical.length, average: avg }, subjectComparison, riskAnalysis, trend: mergedTrend, subjects: subjectMeta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

module.exports = router;

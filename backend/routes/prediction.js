const express  = require('express');
const router   = express.Router();
const axios    = require('axios');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

router.use(protect);

// ── POST /api/predict ───────────────────────────────────────
router.post('/', async (req, res) => {
  const { subjectId, futureLectures, plannedBunks } = req.body;

  if (subjectId === undefined || futureLectures === undefined || plannedBunks === undefined)
    return res.status(400).json({ message: 'subjectId, futureLectures and plannedBunks are required' });

  try {
    // Fetch subject from MySQL
    const [rows] = await pool.query(
      'SELECT * FROM subjects WHERE id = ? AND user_id = ?',
      [subjectId, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Subject not found' });

    const subject  = rows[0];
    const future   = parseInt(futureLectures);
    const bunks    = parseInt(plannedBunks);

    // Local maths fallback
    const futureAttended = subject.attended_classes + (future - bunks);
    const futureTotal    = subject.total_classes + future;
    const predictedPct   = parseFloat(((futureAttended / futureTotal) * 100).toFixed(2));

    let status, statusMessage;
    if (predictedPct >= 80)      { status = 'SAFE';     statusMessage = 'Your attendance will remain healthy.'; }
    else if (predictedPct >= 75) { status = 'WARNING';  statusMessage = 'Attendance is borderline. Be careful.'; }
    else                         { status = 'CRITICAL'; statusMessage = 'Attendance will drop below 75%! Attend more classes!'; }

    // Build projection array for chart
    const projection = [];
    for (let i = 0; i <= future; i++) {
      const att   = subject.attended_classes + Math.max(0, i - Math.min(i, bunks));
      const tot   = subject.total_classes + i;
      projection.push({ lecture: i, percentage: parseFloat(((att / tot) * 100).toFixed(2)) });
    }

    // Try AI service for enhanced prediction
    let aiData = null;
    try {
      const { data } = await axios.post(
        `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/predict`,
        { current_attended: subject.attended_classes, current_total: subject.total_classes, future_lectures: future, planned_bunks: bunks },
        { timeout: 3000 }
      );
      aiData = data;
    } catch (_) { /* AI service offline — use local result */ }

    res.json({
      subject:             subject.subject_name,
      currentAttended:     subject.attended_classes,
      currentTotal:        subject.total_classes,
      currentPercentage:   parseFloat(subject.attendance_percentage),
      futureLectures:      future,
      plannedBunks:        bunks,
      predictedPercentage: aiData?.predicted_percentage ?? predictedPct,
      status:              aiData?.status              ?? status,
      statusMessage:       aiData?.message             ?? statusMessage,
      projection,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating prediction' });
  }
});

module.exports = router;

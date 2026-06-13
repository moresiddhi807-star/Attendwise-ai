const express  = require('express');
const router   = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

router.use(protect);

const calcPct = (attended, total) =>
  total > 0 ? parseFloat(((attended / total) * 100).toFixed(2)) : 0;

// ── GET /api/subjects ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// ── POST /api/subjects ──────────────────────────────────────
router.post(
  '/',
  [
    body('subjectName').trim().notEmpty().withMessage('Subject name is required'),
    body('attendedClasses').isInt({ min: 0 }).withMessage('Attended classes must be 0 or more'),
    body('totalClasses').isInt({ min: 1 }).withMessage('Total classes must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { subjectName, attendedClasses, totalClasses } = req.body;
    const attended = parseInt(attendedClasses);
    const total    = parseInt(totalClasses);

    if (attended > total)
      return res.status(400).json({ message: 'Attended classes cannot exceed total classes' });

    const pct = calcPct(attended, total);

    try {
      const [result] = await pool.query(
        `INSERT INTO subjects (user_id, subject_name, attended_classes, total_classes, attendance_percentage)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, subjectName.trim(), attended, total, pct]
      );
      const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
      res.status(201).json({ message: 'Subject added successfully', subject: rows[0] });
    } catch (err) {
      res.status(500).json({ message: 'Error creating subject' });
    }
  }
);

// ── PUT /api/subjects/:id ───────────────────────────────────
router.put(
  '/:id',
  [
    body('attendedClasses').isInt({ min: 0 }).withMessage('Attended classes must be 0 or more'),
    body('totalClasses').isInt({ min: 1 }).withMessage('Total classes must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { subjectName, attendedClasses, totalClasses } = req.body;
    const attended = parseInt(attendedClasses);
    const total    = parseInt(totalClasses);

    if (attended > total)
      return res.status(400).json({ message: 'Attended classes cannot exceed total classes' });

    const pct = calcPct(attended, total);

    try {
      const [result] = await pool.query(
        `UPDATE subjects
         SET subject_name = ?, attended_classes = ?, total_classes = ?, attendance_percentage = ?
         WHERE id = ? AND user_id = ?`,
        [subjectName.trim(), attended, total, pct, req.params.id, req.user.id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Subject not found' });

      const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
      res.json({ message: 'Subject updated successfully', subject: rows[0] });
    } catch (err) {
      res.status(500).json({ message: 'Error updating subject' });
    }
  }
);

// ── DELETE /api/subjects/:id ────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM subjects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Subject not found' });

    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

module.exports = router;

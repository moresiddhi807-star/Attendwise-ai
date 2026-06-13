const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

// ── POST /api/register ──────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password } = req.body;
    try {
      // Check duplicate email
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
      if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name.trim(), email.toLowerCase(), hashed]
      );

      const userId = result.insertId;
      const [user] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);

      res.status(201).json({ message: 'Registration successful', token: generateToken(userId), user: user[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// ── POST /api/login ─────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
      if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid email or password' });

      res.json({
        message: 'Login successful',
        token: generateToken(user.id),
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// ── GET /api/profile ────────────────────────────────────────
router.get('/profile', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;

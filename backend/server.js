const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
require('dotenv').config();

const { connectDB, initDB } = require('./config/db');

const authRoutes       = require('./routes/auth');
const subjectRoutes    = require('./routes/subjects');
const predictionRoutes = require('./routes/prediction');
const advisorRoutes    = require('./routes/advisor');
const analyticsRoutes  = require('./routes/analytics');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/api',            authRoutes);
app.use('/api/subjects',   subjectRoutes);
app.use('/api/predict',    predictionRoutes);
app.use('/api/advisor',    advisorRoutes);
app.use('/api/analytics',  analyticsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', db: 'mysql' }));

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Boot ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await initDB();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})();

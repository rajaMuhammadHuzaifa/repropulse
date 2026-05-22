const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─── Security middleware ───────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ─── Rate limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 min
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ReproPulse API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── API routes (we'll add these as we build) ──────────
// app.use('/api/auth',    require('./routes/auth'));
// app.use('/api/clients', require('./routes/clients'));
// app.use('/api/reports', require('./routes/reports'));

// ─── 404 handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ─── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ ReproPulse API running on port ${PORT}`);
});
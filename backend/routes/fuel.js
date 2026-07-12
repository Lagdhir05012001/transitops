const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all fuel logs
router.get('/', authMiddleware, checkRole(['Admin', 'Fleet Manager', 'Dispatcher', 'Financial Analyst']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM fuel_logs').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new fuel log
router.post('/', authMiddleware, checkRole(['Admin', 'Fleet Manager', 'Dispatcher']), (req, res) => {
  const { vehicleId, liters, cost, date, odometer } = req.body;

  try {
    const info = db.prepare(
      'INSERT INTO fuel_logs (vehicleId, liters, cost, date, odometer) VALUES (?, ?, ?, ?, ?)'
    ).run(
      +vehicleId,
      +liters || 0,
      +cost || 0,
      date || new Date().toISOString().slice(0, 10),
      +odometer || 0
    );
    const log = db.prepare('SELECT * FROM fuel_logs WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

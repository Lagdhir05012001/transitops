const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all expenses
router.get('/', authMiddleware, checkRole(['Admin', 'Financial Analyst', 'Fleet Manager']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM expenses').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new expense
router.post('/', authMiddleware, checkRole(['Admin', 'Financial Analyst', 'Fleet Manager']), (req, res) => {
  const { vehicleId, type, amount, date, notes } = req.body;

  try {
    const info = db.prepare(
      'INSERT INTO expenses (vehicleId, type, amount, date, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(
      +vehicleId,
      type || 'Miscellaneous',
      +amount || 0,
      date || new Date().toISOString().slice(0, 10),
      notes || ''
    );
    const exp = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: exp });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

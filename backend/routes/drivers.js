const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all drivers
router.get('/', authMiddleware, checkRole(['Admin', 'Safety Officer', 'Dispatcher']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM drivers').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new driver
router.post('/', authMiddleware, checkRole(['Admin', 'Safety Officer']), (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status } = req.body;
  try {
    const info = db.prepare(
      'INSERT INTO drivers (name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name,
      licenseNumber,
      licenseCategory || 'B',
      licenseExpiry,
      contact || '',
      safetyScore !== undefined ? safetyScore : 100,
      status || 'Available'
    );
    const d = db.prepare('SELECT * FROM drivers WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: d });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

// PUT status or suspend
router.put('/:id/status', authMiddleware, checkRole(['Admin', 'Safety Officer']), (req, res) => {

  const { status } = req.body;
  try {
    db.prepare('UPDATE drivers SET status = ? WHERE id = ?').run(status, req.params.id);
    const d = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: d });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

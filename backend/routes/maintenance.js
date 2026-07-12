const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all maintenance
router.get('/', authMiddleware, checkRole(['Admin', 'Fleet Manager', 'Financial Analyst']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM maintenance').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new maintenance
router.post('/', authMiddleware, checkRole(['Admin', 'Fleet Manager']), (req, res) => {
  const { vehicleId, type, description, cost, date } = req.body;
  const tx = db.transaction(() => {
    const info = db.prepare(
      'INSERT INTO maintenance (vehicleId, type, description, cost, date, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      +vehicleId,
      type,
      description || '',
      cost ? +cost : 0,
      date || new Date().toISOString().slice(0, 10),
      'Open'
    );
    // Switch vehicle status to In Shop
    db.prepare("UPDATE vehicles SET status = 'In Shop' WHERE id = ?").run(+vehicleId);
    return info.lastInsertRowid;
  });

  try {
    const insertId = tx();
    const m = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(insertId);
    res.json({ success: true, data: m });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

// PUT close maintenance
router.put('/:id/close', authMiddleware, checkRole(['Admin', 'Fleet Manager']), (req, res) => {
  const m = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);

  if (!m) return res.status(404).json({ success: false, errors: ['not found'] });

  const tx = db.transaction(() => {
    db.prepare("UPDATE maintenance SET status = 'Closed' WHERE id = ?").run(req.params.id);
    db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status = 'In Shop'").run(m.vehicleId);
  });

  try {
    tx();
    const updated = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

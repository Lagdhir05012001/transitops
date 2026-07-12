const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all vehicles
router.get('/', authMiddleware, checkRole(['Admin', 'Fleet Manager', 'Dispatcher', 'Financial Analyst', 'Safety Officer']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM vehicles').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new vehicle
router.post('/', authMiddleware, checkRole(['Admin', 'Fleet Manager']), (req, res) => {
  const { registration, name, model, type, capacity, odometer, cost, status, region } = req.body;
  try {
    const info = db.prepare(
      'INSERT INTO vehicles (registration, name, model, type, capacity, odometer, cost, status, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      registration,
      name,
      model || '',
      type || 'Van',
      capacity || 0,
      odometer || 0,
      cost || 0,
      status || 'Available',
      region || 'North'
    );
    const v = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

// PUT status or updates
router.put('/:id/status', authMiddleware, checkRole(['Admin', 'Fleet Manager']), (req, res) => {

  const { status } = req.body;
  try {
    db.prepare('UPDATE vehicles SET status = ? WHERE id = ?').run(status, req.params.id);
    const v = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

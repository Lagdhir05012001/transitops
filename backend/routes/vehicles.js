const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  const { registrationNumber, model, type, maxLoadKg, odometer, acquisitionCost, status } = req.body;
  try {
    const info = db.prepare('INSERT INTO vehicles (registrationNumber, model, type, maxLoadKg, odometer, acquisitionCost, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(registrationNumber, model, type, maxLoadKg || 0, odometer || 0, acquisitionCost || 0, status || 'Available');
    const v = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM vehicles').all();
  res.json({ success: true, data: rows });
});

router.get('/:id', (req, res) => {
  const v = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!v) return res.status(404).json({ success: false, errors: ['not found'] });
  res.json({ success: true, data: v });
});

router.put('/:id/status', (req, res) => {
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

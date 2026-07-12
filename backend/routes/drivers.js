const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, licenseNumber, licenseExpiryDate, contactNumber, status } = req.body;
  try {
    const info = db.prepare('INSERT INTO drivers (name, licenseNumber, licenseExpiryDate, contactNumber, status) VALUES (?, ?, ?, ?, ?)')
      .run(name, licenseNumber, licenseExpiryDate, contactNumber, status || 'Available');
    const d = db.prepare('SELECT * FROM drivers WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: d });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM drivers').all();
  res.json({ success: true, data: rows });
});

module.exports = router;

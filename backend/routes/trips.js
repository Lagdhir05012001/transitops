const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  const { source, destination, plannedDistanceKm, cargoWeightKg, vehicleId, driverId } = req.body;
  try {
    const info = db.prepare('INSERT INTO trips (source, destination, plannedDistanceKm, cargoWeightKg, vehicleId, driverId, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(source, destination, plannedDistanceKm || 0, cargoWeightKg || 0, vehicleId || null, driverId || null, 'Draft');
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

// Dispatch trip
router.post('/:id/dispatch', (req, res) => {
  const tripId = req.params.id;
  const { vehicleId, driverId } = req.body;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return res.status(404).json({ success: false, errors: ['trip not found'] });
  // basic validations
  const vehicle = vehicleId ? db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId) : null;
  const driver = driverId ? db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId) : null;
  if (vehicle && (vehicle.status === 'In Shop' || vehicle.status === 'Retired')) return res.status(400).json({ success: false, errors: ['vehicle not available'] });
  if (driver && driver.status === 'Suspended') return res.status(400).json({ success: false, errors: ['driver suspended'] });
  if (vehicle && trip.cargoWeightKg > vehicle.maxLoadKg) return res.status(400).json({ success: false, errors: ['cargo exceeds capacity'] });
  const tx = db.transaction(() => {
    db.prepare('UPDATE trips SET status = ?, vehicleId = ?, driverId = ? WHERE id = ?').run('Dispatched', vehicleId || trip.vehicleId, driverId || trip.driverId, tripId);
    if (vehicleId) db.prepare("UPDATE vehicles SET status = 'On Trip' WHERE id = ?").run(vehicleId);
    if (driverId) db.prepare("UPDATE drivers SET status = 'On Trip' WHERE id = ?").run(driverId);
  });
  try {
    tx();
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// Complete trip
router.post('/:id/complete', (req, res) => {
  const tripId = req.params.id;
  const { finalOdometer, fuelConsumedLiters } = req.body;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return res.status(404).json({ success: false, errors: ['trip not found'] });
  const tx = db.transaction(() => {
    db.prepare('UPDATE trips SET status = ?, actualDistanceKm = ? WHERE id = ?').run(trip.plannedDistanceKm || 0, trip.plannedDistanceKm || 0, tripId);
    if (trip.vehicleId) db.prepare("UPDATE vehicles SET status = 'Available', odometer = ? WHERE id = ?").run(finalOdometer || null, trip.vehicleId);
    if (trip.driverId) db.prepare("UPDATE drivers SET status = 'Available' WHERE id = ?").run(trip.driverId);
    if (fuelConsumedLiters) db.prepare('INSERT INTO fuel_logs (vehicleId, date, liters, cost, tripId) VALUES (?, ?, ?, ?, ?)').run(trip.vehicleId, new Date().toISOString(), fuelConsumedLiters, 0, tripId);
  });
  try {
    tx();
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM trips').all();
  res.json({ success: true, data: rows });
});

module.exports = router;

const express = require('express');
const db = require('../db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// GET all trips
router.get('/', authMiddleware, checkRole(['Admin', 'Dispatcher', 'Fleet Manager', 'Financial Analyst', 'Safety Officer']), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM trips').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST new trip (Draft)
router.post('/', authMiddleware, checkRole(['Admin', 'Dispatcher']), (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeight, distance } = req.body;
  try {
    const vehicle = vehicleId ? db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId) : null;
    const driver = driverId ? db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId) : null;

    if (vehicle) {
      if (vehicle.status === 'On Trip') {
        return res.status(400).json({ success: false, errors: ['Selected vehicle is already On Trip.'] });
      }
      if (vehicle.status === 'In Shop') {
        return res.status(400).json({ success: false, errors: ['Selected vehicle is In Shop (under maintenance).'] });
      }
      if (vehicle.status === 'Retired') {
        return res.status(400).json({ success: false, errors: ['Selected vehicle is Retired.'] });
      }
      if (cargoWeight && +cargoWeight > vehicle.capacity) {
        return res.status(400).json({ success: false, errors: [`Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`] });
      }
    }

    if (driver) {
      if (driver.status === 'On Trip') {
        return res.status(400).json({ success: false, errors: ['Selected driver is already On Trip.'] });
      }
      if (driver.status === 'Suspended') {
        return res.status(400).json({ success: false, errors: ['Selected driver is Suspended.'] });
      }
      if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
        return res.status(400).json({ success: false, errors: ['Selected driver driving license has expired.'] });
      }
    }

    const info = db.prepare(
      'INSERT INTO trips (source, destination, vehicleId, driverId, cargoWeight, distance, status, fuelUsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      source,
      destination,
      vehicleId ? +vehicleId : null,
      driverId ? +driverId : null,
      cargoWeight ? +cargoWeight : 0,
      distance ? +distance : 0,
      'Draft',
      0
    );
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(400).json({ success: false, errors: [err.message] });
  }
});

// POST dispatch
router.post('/:id/dispatch', authMiddleware, checkRole(['Admin', 'Dispatcher']), (req, res) => {
  const tripId = req.params.id;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return res.status(404).json({ success: false, errors: ['trip not found'] });

  const vehicleId = trip.vehicleId;
  const driverId = trip.driverId;

  const vehicle = vehicleId ? db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId) : null;
  const driver = driverId ? db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId) : null;

  if (vehicle) {
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ success: false, errors: ['Selected vehicle is already On Trip.'] });
    }
    if (vehicle.status === 'In Shop') {
      return res.status(400).json({ success: false, errors: ['Selected vehicle is In Shop (under maintenance).'] });
    }
    if (vehicle.status === 'Retired') {
      return res.status(400).json({ success: false, errors: ['Selected vehicle is Retired.'] });
    }
    if (trip.cargoWeight > vehicle.capacity) {
      return res.status(400).json({ success: false, errors: [`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`] });
    }
  }

  if (driver) {
    if (driver.status === 'On Trip') {
      return res.status(400).json({ success: false, errors: ['Selected driver is already On Trip.'] });
    }
    if (driver.status === 'Suspended') {
      return res.status(400).json({ success: false, errors: ['Selected driver is Suspended.'] });
    }
    if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({ success: false, errors: ['Selected driver driving license has expired.'] });
    }
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE trips SET status = ? WHERE id = ?').run('Dispatched', tripId);
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

// POST complete
router.post('/:id/complete', authMiddleware, checkRole(['Admin', 'Dispatcher']), (req, res) => {
  const tripId = req.params.id;
  const { fuelUsed } = req.body;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return res.status(404).json({ success: false, errors: ['trip not found'] });

  const tx = db.transaction(() => {
    db.prepare('UPDATE trips SET status = ?, fuelUsed = ? WHERE id = ?').run('Completed', fuelUsed || 0, tripId);
    if (trip.vehicleId) {
      db.prepare("UPDATE vehicles SET status = 'Available', odometer = odometer + ? WHERE id = ?")
        .run(trip.distance || 0, trip.vehicleId);
    }
    if (trip.driverId) {
      db.prepare("UPDATE drivers SET status = 'Available' WHERE id = ?").run(trip.driverId);
    }
    // Also auto-add a fuel log entry if fuel was consumed
    if (fuelUsed && trip.vehicleId) {
      db.prepare('INSERT INTO fuel_logs (vehicleId, liters, cost, date, odometer) VALUES (?, ?, ?, ?, ?)')
        .run(trip.vehicleId, fuelUsed, fuelUsed * 1.7, new Date().toISOString().slice(0, 10), 0);
    }
  });

  try {
    tx();
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

// POST cancel
router.post('/:id/cancel', authMiddleware, checkRole(['Admin', 'Dispatcher']), (req, res) => {
  const tripId = req.params.id;

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return res.status(404).json({ success: false, errors: ['trip not found'] });

  const tx = db.transaction(() => {
    db.prepare('UPDATE trips SET status = ? WHERE id = ?').run('Cancelled', tripId);
    if (trip.status === 'Dispatched') {
      if (trip.vehicleId) db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ?").run(trip.vehicleId);
      if (trip.driverId) db.prepare("UPDATE drivers SET status = 'Available' WHERE id = ?").run(trip.driverId);
    }
  });

  try {
    tx();
    const t = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const authRoutes = require('./routes/auth');
const vehiclesRoutes = require('./routes/vehicles');
const driversRoutes = require('./routes/drivers');
const tripsRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const fuelRoutes = require('./routes/fuel');
const expensesRoutes = require('./routes/expenses');

const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/drivers', driversRoutes);
app.use('/trips', tripsRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/fuel', fuelRoutes);
app.use('/expenses', expensesRoutes);

// Detailed dashboard KPIs from SQLite
app.get('/dashboard/kpis', authMiddleware, (req, res) => {
  try {
    const { type, status, region } = req.query;

    let vehicles = db.prepare("SELECT * FROM vehicles").all();
    let trips = db.prepare("SELECT * FROM trips").all();
    let drivers = db.prepare("SELECT * FROM drivers").all();

    // Apply filters
    if (type && type !== 'All') {
      vehicles = vehicles.filter(v => v.type === type);
    }
    if (status && status !== 'All') {
      vehicles = vehicles.filter(v => v.status === status);
    }
    if (region && region !== 'All') {
      vehicles = vehicles.filter(v => v.region === region);
    }

    const vehicleIds = new Set(vehicles.map(v => v.id));

    const totalV = vehicles.length;
    const availV = vehicles.filter(v => v.status === 'Available').length;
    const inShopV = vehicles.filter(v => v.status === 'In Shop').length;
    const retiredV = vehicles.filter(v => v.status === 'Retired').length;

    // Filter trips associated with the selected set of vehicles
    const activeTrips = trips.filter(t => t.status === 'Dispatched' && vehicleIds.has(t.vehicleId)).length;
    const pendingTrips = trips.filter(t => t.status === 'Draft' && vehicleIds.has(t.vehicleId)).length;

    // Filter drivers associated with the active trips of the selected set of vehicles
    const activeTripDrivers = new Set(
      trips.filter(t => t.status === 'Dispatched' && vehicleIds.has(t.vehicleId)).map(t => t.driverId)
    );
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip' && activeTripDrivers.has(d.id)).length;

    const activeV = vehicles.filter(v => v.status !== 'Retired').length;
    const utilization = totalV > 0 ? Math.round((activeV / totalV) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalV,
        availV,
        inShopV,
        retiredV,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        utilization
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

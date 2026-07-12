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

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/drivers', driversRoutes);
app.use('/trips', tripsRoutes);

// Simple dashboard KPIs
app.get('/dashboard/kpis', (req, res) => {
  try {
    const activeVehicles = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'Available'").get().c;
    const inShop = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'In Shop'").get().c;
    const onTrip = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'On Trip'").get().c;
    const activeTrips = db.prepare("SELECT COUNT(*) as c FROM trips WHERE status = 'Dispatched'").get().c;
    const driversOnDuty = db.prepare("SELECT COUNT(*) as c FROM drivers WHERE status = 'On Trip'").get().c;
    res.json({ success: true, data: { activeVehicles, inShop, onTrip, activeTrips, driversOnDuty } });
  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

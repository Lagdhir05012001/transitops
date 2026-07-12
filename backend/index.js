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
    const totalV = db.prepare("SELECT COUNT(*) as c FROM vehicles").get().c;
    const availV = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'Available'").get().c;
    const inShopV = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'In Shop'").get().c;
    const retiredV = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'Retired'").get().c;
    const activeTrips = db.prepare("SELECT COUNT(*) as c FROM trips WHERE status = 'Dispatched'").get().c;
    const pendingTrips = db.prepare("SELECT COUNT(*) as c FROM trips WHERE status = 'Draft'").get().c;
    const driversOnDuty = db.prepare("SELECT COUNT(*) as c FROM drivers WHERE status = 'On Trip'").get().c;
    
    const activeV = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status != 'Retired'").get().c;
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

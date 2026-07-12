const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data.json');

// Helper to load/save JSON database
function loadData() {
  if (!fs.existsSync(dbPath)) {
    const initial = {
      users: [],
      vehicles: [],
      drivers: [],
      trips: [],
      maintenance: [],
      fuel_logs: [],
      expenses: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {
      users: [],
      vehicles: [],
      drivers: [],
      trips: [],
      maintenance: [],
      fuel_logs: [],
      expenses: []
    };
  }
}

function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize tables with schema matching frontend types
let data = loadData();

// Seed initial users for all 5 roles
const usersToSeed = [
  { name: 'Admin User', email: 'admin@transitops.com', role: 'Admin' },
  { name: 'Fleet Manager', email: 'fleet@transitops.com', role: 'Fleet Manager' },
  { name: 'Dispatcher User', email: 'dispatch@transitops.com', role: 'Dispatcher' },
  { name: 'Safety Officer', email: 'safety@transitops.com', role: 'Safety Officer' },
  { name: 'Financial Analyst', email: 'finance@transitops.com', role: 'Financial Analyst' }
];

usersToSeed.forEach(u => {
  const existing = data.users.find(x => x.email === u.email);
  if (!existing) {
    const hash = bcrypt.hashSync('password', 8);
    data.users.push({
      id: data.users.length + 1,
      name: u.name,
      email: u.email,
      passwordHash: hash,
      roles: u.role,
      createdAt: new Date().toISOString()
    });
  }
});

// Seed initial vehicles if empty
if (data.vehicles.length === 0) {
  data.vehicles.push(
    { id: 1, registration: 'Van-05', name: 'City Van', model: 'Sprinter 315', type: 'Van', capacity: 500, odometer: 12000, cost: 45000, status: 'Available', region: 'North' },
    { id: 2, registration: 'Bus-12', name: 'Metro Bus', model: 'Aero 160', type: 'Bus', capacity: 1200, odometer: 35000, cost: 98000, status: 'Available', region: 'South' },
    { id: 3, registration: 'Truck-07', name: 'Cargo Truck', model: 'Pro 700T', type: 'Truck', capacity: 1500, odometer: 28000, cost: 112000, status: 'In Shop', region: 'East' },
    { id: 4, registration: 'Van-09', name: 'Express Van', model: 'Transit L3', type: 'Van', capacity: 600, odometer: 8400, cost: 52000, status: 'Available', region: 'West' }
  );
}

// Seed initial drivers if empty
if (data.drivers.length === 0) {
  data.drivers.push(
    { id: 1, name: 'Alex Carter', licenseNumber: 'DL-1001', licenseCategory: 'B', licenseExpiry: '2027-08-10', contact: '+1 555 0101', safetyScore: 92, status: 'Available' },
    { id: 2, name: 'Mina Patel', licenseNumber: 'DL-2002', licenseCategory: 'C', licenseExpiry: '2026-10-01', contact: '+1 555 0102', safetyScore: 88, status: 'Available' },
    { id: 3, name: 'Jordan Lee', licenseNumber: 'DL-3003', licenseCategory: 'B', licenseExpiry: '2025-03-15', contact: '+1 555 0103', safetyScore: 74, status: 'Off Duty' },
    { id: 4, name: 'Sam Rivera', licenseNumber: 'DL-4004', licenseCategory: 'C', licenseExpiry: '2027-12-20', contact: '+1 555 0104', safetyScore: 95, status: 'Available' }
  );
}

// Seed initial trips if empty
if (data.trips.length === 0) {
  data.trips.push(
    { id: 1, source: 'Depot A', destination: 'North Hub', vehicleId: 1, driverId: 1, cargoWeight: 450, distance: 140, status: 'Completed', fuelUsed: 18 },
    { id: 2, source: 'Depot B', destination: 'South Port', vehicleId: 2, driverId: 2, cargoWeight: 800, distance: 220, status: 'Draft', fuelUsed: 0 }
  );
}

// Seed initial maintenance if empty
if (data.maintenance.length === 0) {
  data.maintenance.push(
    { id: 1, vehicleId: 3, type: 'Oil Change', description: 'Routine 10k service', cost: 180, date: '2026-07-10', status: 'Open' },
    { id: 2, vehicleId: 1, type: 'Tire Rotation', description: 'Front–rear rotation', cost: 80, date: '2026-06-20', status: 'Closed' }
  );
}

// Seed initial fuel logs if empty
if (data.fuel_logs.length === 0) {
  data.fuel_logs.push(
    { id: 1, vehicleId: 1, liters: 50, cost: 85, date: '2026-07-01', odometer: 11800 },
    { id: 2, vehicleId: 2, liters: 90, cost: 153, date: '2026-07-03', odometer: 34800 },
    { id: 3, vehicleId: 4, liters: 40, cost: 68, date: '2026-07-08', odometer: 8200 }
  );
}

// Seed initial expenses if empty
if (data.expenses.length === 0) {
  data.expenses.push(
    { id: 1, vehicleId: 1, type: 'Toll', amount: 12, date: '2026-07-01', notes: 'Highway toll Depot A→North Hub' },
    { id: 2, vehicleId: 2, type: 'Insurance', amount: 420, date: '2026-07-01', notes: 'Monthly premium' },
    { id: 3, vehicleId: 3, type: 'Repairs', amount: 380, date: '2026-07-10', notes: 'Brake pad replacement' }
  );
}

saveData(data);

// Ensure all existing vehicles have a region field
let dataChanged = false;
data.vehicles.forEach((v, index) => {
  if (!v.region) {
    const regions = ['North', 'South', 'East', 'West'];
    v.region = regions[index % regions.length];
    dataChanged = true;
  }
});
if (dataChanged) {
  saveData(data);
}

// SQLite API Emulation using JS array/object manipulation
class Statement {
  constructor(sql) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  get(emailOrId) {
    data = loadData();
    // SELECT * FROM users WHERE email = ?
    if (this.sql.includes('FROM users WHERE email = ?')) {
      return data.users.find(u => u.email === emailOrId) || null;
    }
    // SELECT id, name, email, roles FROM users WHERE id = ?
    if (this.sql.includes('FROM users WHERE id = ?')) {
      return data.users.find(u => u.id === +emailOrId) || null;
    }
    // SELECT * FROM vehicles WHERE id = ?
    if (this.sql.includes('FROM vehicles WHERE id = ?')) {
      return data.vehicles.find(v => v.id === +emailOrId) || null;
    }
    // SELECT * FROM drivers WHERE id = ?
    if (this.sql.includes('FROM drivers WHERE id = ?')) {
      return data.drivers.find(d => d.id === +emailOrId) || null;
    }
    // SELECT * FROM trips WHERE id = ?
    if (this.sql.includes('FROM trips WHERE id = ?')) {
      return data.trips.find(t => t.id === +emailOrId) || null;
    }
    // SELECT * FROM maintenance WHERE id = ?
    if (this.sql.includes('FROM maintenance WHERE id = ?')) {
      return data.maintenance.find(m => m.id === +emailOrId) || null;
    }

    // SELECT COUNT(*) as c FROM ...
    if (this.sql.includes('SELECT COUNT(*) as c FROM vehicles WHERE status =')) {
      const match = this.sql.match(/status\s*=\s*'([^']+)'/);
      const status = match ? match[1] : '';
      const count = data.vehicles.filter(v => v.status === status).length;
      return { c: count };
    }
    if (this.sql.includes('SELECT COUNT(*) as c FROM vehicles')) {
      return { c: data.vehicles.length };
    }
    if (this.sql.includes('SELECT COUNT(*) as c FROM trips WHERE status =')) {
      const match = this.sql.match(/status\s*=\s*'([^']+)'/);
      const status = match ? match[1] : '';
      const count = data.trips.filter(t => t.status === status).length;
      return { c: count };
    }
    if (this.sql.includes('SELECT COUNT(*) as c FROM drivers WHERE status =')) {
      const match = this.sql.match(/status\s*=\s*'([^']+)'/);
      const status = match ? match[1] : '';
      const count = data.drivers.filter(d => d.status === status).length;
      return { c: count };
    }
    return null;
  }

  all() {
    data = loadData();
    if (this.sql.includes('FROM users')) return data.users;
    if (this.sql.includes('FROM vehicles')) return data.vehicles;
    if (this.sql.includes('FROM drivers')) return data.drivers;
    if (this.sql.includes('FROM trips')) return data.trips;
    if (this.sql.includes('FROM maintenance')) return data.maintenance;
    if (this.sql.includes('FROM fuel_logs')) return data.fuel_logs;
    if (this.sql.includes('FROM expenses')) return data.expenses;
    return [];
  }

  run(...params) {
    data = loadData();
    let lastInsertRowid = 0;

    // INSERT INTO users
    if (this.sql.includes('INSERT INTO users')) {
      const [name, email, passwordHash, roles] = params;
      lastInsertRowid = data.users.length + 1;
      data.users.push({
        id: lastInsertRowid,
        name,
        email,
        passwordHash,
        roles,
        createdAt: new Date().toISOString()
      });
    }
    // INSERT INTO vehicles
    else if (this.sql.includes('INSERT INTO vehicles')) {
      const [registration, name, model, type, capacity, odometer, cost, status, region] = params;
      if (data.vehicles.some(v => v.registration === registration)) {
        throw new Error('UNIQUE constraint failed: vehicles.registration');
      }
      lastInsertRowid = data.vehicles.length + 1;
      data.vehicles.push({
        id: lastInsertRowid,
        registration,
        name,
        model,
        type,
        capacity,
        odometer: odometer || 0,
        cost: cost || 0,
        status: status || 'Available',
        region: region || 'North'
      });
    }
    // INSERT INTO drivers
    else if (this.sql.includes('INSERT INTO drivers')) {
      const [name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status] = params;
      lastInsertRowid = data.drivers.length + 1;
      data.drivers.push({
        id: lastInsertRowid,
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        contact,
        safetyScore: safetyScore !== undefined ? safetyScore : 100,
        status: status || 'Available'
      });
    }
    // INSERT INTO trips
    else if (this.sql.includes('INSERT INTO trips')) {
      const [source, destination, vehicleId, driverId, cargoWeight, distance, status, fuelUsed] = params;
      lastInsertRowid = data.trips.length + 1;
      data.trips.push({
        id: lastInsertRowid,
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        distance,
        status: status || 'Draft',
        fuelUsed: fuelUsed || 0,
        createdAt: new Date().toISOString()
      });
    }
    // INSERT INTO maintenance
    else if (this.sql.includes('INSERT INTO maintenance')) {
      const [vehicleId, type, description, cost, date, status] = params;
      lastInsertRowid = data.maintenance.length + 1;
      data.maintenance.push({
        id: lastInsertRowid,
        vehicleId,
        type,
        description,
        cost: cost || 0,
        date,
        status: status || 'Open'
      });
    }
    // INSERT INTO fuel_logs
    else if (this.sql.includes('INSERT INTO fuel_logs')) {
      const [vehicleId, liters, cost, date, odometer] = params;
      lastInsertRowid = data.fuel_logs.length + 1;
      data.fuel_logs.push({
        id: lastInsertRowid,
        vehicleId,
        liters,
        cost: cost || 0,
        date,
        odometer: odometer || 0
      });
    }
    // INSERT INTO expenses
    else if (this.sql.includes('INSERT INTO expenses')) {
      const [vehicleId, type, amount, date, notes] = params;
      lastInsertRowid = data.expenses.length + 1;
      data.expenses.push({
        id: lastInsertRowid,
        vehicleId,
        type,
        amount: amount || 0,
        date,
        notes: notes || ''
      });
    }
    // UPDATE vehicles SET status = 'On Trip' WHERE id = ?
    else if (this.sql.includes("UPDATE vehicles SET status = 'On Trip' WHERE id = ?")) {
      const [id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v) v.status = 'On Trip';
    }
    // UPDATE vehicles SET status = 'Available' WHERE id = ? AND status = 'In Shop'
    else if (this.sql.includes("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status = 'In Shop'")) {
      const [id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v && v.status !== 'Retired') v.status = 'Available';
    }
    // UPDATE vehicles SET status = 'Available' WHERE id = ?
    else if (this.sql.includes("UPDATE vehicles SET status = 'Available' WHERE id = ?")) {
      const [id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v && v.status !== 'Retired') v.status = 'Available';
    }
    // UPDATE vehicles SET status = 'In Shop' WHERE id = ?
    else if (this.sql.includes("UPDATE vehicles SET status = 'In Shop' WHERE id = ?")) {
      const [id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v) v.status = 'In Shop';
    }
    // UPDATE vehicles SET status = ? WHERE id = ?
    else if (this.sql.includes("UPDATE vehicles SET status = ? WHERE id = ?")) {
      const [status, id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v) v.status = status;
    }
    // UPDATE vehicles SET status = 'Available', odometer = odometer + ? WHERE id = ?
    else if (this.sql.includes("UPDATE vehicles SET status = 'Available', odometer = odometer + ? WHERE id = ?")) {
      const [distance, id] = params;
      const v = data.vehicles.find(x => x.id === +id);
      if (v) {
        if (v.status !== 'Retired') v.status = 'Available';
        v.odometer = (v.odometer || 0) + (distance || 0);
      }
    }
    // UPDATE drivers SET status = 'On Trip' WHERE id = ?
    else if (this.sql.includes("UPDATE drivers SET status = 'On Trip' WHERE id = ?")) {
      const [id] = params;
      const d = data.drivers.find(x => x.id === +id);
      if (d) d.status = 'On Trip';
    }
    // UPDATE drivers SET status = 'Available' WHERE id = ?
    else if (this.sql.includes("UPDATE drivers SET status = 'Available' WHERE id = ?")) {
      const [id] = params;
      const d = data.drivers.find(x => x.id === +id);
      if (d) d.status = 'Available';
    }
    // UPDATE drivers SET status = ? WHERE id = ?
    else if (this.sql.includes("UPDATE drivers SET status = ? WHERE id = ?")) {
      const [status, id] = params;
      const d = data.drivers.find(x => x.id === +id);
      if (d) d.status = status;
    }
    // UPDATE trips SET status = ? WHERE id = ?
    else if (this.sql.includes("UPDATE trips SET status = ? WHERE id = ?")) {
      const [status, id] = params;
      const t = data.trips.find(x => x.id === +id);
      if (t) t.status = status;
    }
    // UPDATE trips SET status, fuelUsed
    else if (this.sql.includes("UPDATE trips SET status = ?, fuelUsed = ? WHERE id = ?")) {
      const [status, fuelUsed, id] = params;
      const t = data.trips.find(x => x.id === +id);
      if (t) {
        t.status = status;
        t.fuelUsed = fuelUsed;
      }
    }
    // UPDATE maintenance SET status = 'Closed' WHERE id = ?
    else if (this.sql.includes("UPDATE maintenance SET status = 'Closed' WHERE id = ?")) {
      const [id] = params;
      const m = data.maintenance.find(x => x.id === +id);
      if (m) m.status = 'Closed';
    }
    // UPDATE maintenance SET status = ? WHERE id = ?
    else if (this.sql.includes("UPDATE maintenance SET status = ? WHERE id = ?")) {
      const [status, id] = params;
      const m = data.maintenance.find(x => x.id === +id);
      if (m) m.status = status;
    }

    saveData(data);
    return { lastInsertRowid };
  }
}

const db = {
  prepare(sql) {
    return new Statement(sql);
  },
  transaction(fn) {
    return (...args) => {
      // In-memory data copy to roll back on failure
      const backup = JSON.stringify(data);
      try {
        const res = fn(...args);
        return res;
      } catch (err) {
        data = JSON.parse(backup);
        saveData(data);
        throw err;
      }
    };
  }
};

module.exports = db;

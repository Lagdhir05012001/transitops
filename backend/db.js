const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

// Initialize tables
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  passwordHash TEXT,
  roles TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registrationNumber TEXT UNIQUE,
  model TEXT,
  type TEXT,
  maxLoadKg INTEGER,
  odometer INTEGER DEFAULT 0,
  acquisitionCost INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Available'
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  licenseNumber TEXT,
  licenseExpiryDate TEXT,
  contactNumber TEXT,
  safetyScore INTEGER DEFAULT 100,
  status TEXT DEFAULT 'Available'
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT,
  destination TEXT,
  plannedDistanceKm INTEGER,
  actualDistanceKm INTEGER,
  cargoWeightKg INTEGER,
  vehicleId INTEGER,
  driverId INTEGER,
  status TEXT DEFAULT 'Draft',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicleId INTEGER,
  maintenanceType TEXT,
  description TEXT,
  status TEXT DEFAULT 'Open',
  startDate TEXT,
  completedDate TEXT,
  estimatedCost INTEGER,
  actualCost INTEGER
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS fuel_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicleId INTEGER,
  date TEXT,
  liters REAL,
  cost INTEGER,
  tripId INTEGER
)`).run();

// Seed admin user if not exists
const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@local');
if (!admin) {
  const hash = bcrypt.hashSync('password', 8);
  db.prepare('INSERT INTO users (name, email, passwordHash, roles) VALUES (?, ?, ?, ?)')
    .run('Admin', 'admin@local', hash, 'admin');
}

module.exports = db;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Types ────────────────────────────────────────────────────────
type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
type MaintenanceStatus = 'Open' | 'Closed';

interface Vehicle {
  id: number; registration: string; name: string; model: string;
  type: 'Van' | 'Bus' | 'Truck'; capacity: number; odometer: number;
  cost: number; status: VehicleStatus;
}
interface Driver {
  id: number; name: string; licenseNumber: string; licenseCategory: string;
  licenseExpiry: string; contact: string; safetyScore: number; status: DriverStatus;
}
interface Trip {
  id: number; source: string; destination: string; vehicleId: number; driverId: number;
  cargoWeight: number; distance: number; status: TripStatus; fuelUsed?: number;
}
interface Maintenance {
  id: number; vehicleId: number; type: string; description: string;
  cost: number; date: string; status: MaintenanceStatus;
}
interface FuelLog {
  id: number; vehicleId: number; liters: number; cost: number; date: string; odometer: number;
}
interface Expense {
  id: number; vehicleId: number; type: string; amount: number; date: string; notes: string;
}

// ── Seed Data ────────────────────────────────────────────────────
const seedVehicles: Vehicle[] = [
  { id: 1, registration: 'Van-05', name: 'City Van', model: 'Sprinter 315', type: 'Van', capacity: 500, odometer: 12000, cost: 45000, status: 'Available' },
  { id: 2, registration: 'Bus-12', name: 'Metro Bus', model: 'Aero 160', type: 'Bus', capacity: 1200, odometer: 35000, cost: 98000, status: 'Available' },
  { id: 3, registration: 'Truck-07', name: 'Cargo Truck', model: 'Pro 700T', type: 'Truck', capacity: 1500, odometer: 28000, cost: 112000, status: 'In Shop' },
  { id: 4, registration: 'Van-09', name: 'Express Van', model: 'Transit L3', type: 'Van', capacity: 600, odometer: 8400, cost: 52000, status: 'Available' },
];
const seedDrivers: Driver[] = [
  { id: 1, name: 'Alex Carter', licenseNumber: 'DL-1001', licenseCategory: 'B', licenseExpiry: '2027-08-10', contact: '+1 555 0101', safetyScore: 92, status: 'Available' },
  { id: 2, name: 'Mina Patel', licenseNumber: 'DL-2002', licenseCategory: 'C', licenseExpiry: '2026-10-01', contact: '+1 555 0102', safetyScore: 88, status: 'Available' },
  { id: 3, name: 'Jordan Lee', licenseNumber: 'DL-3003', licenseCategory: 'B', licenseExpiry: '2025-03-15', contact: '+1 555 0103', safetyScore: 74, status: 'Off Duty' },
  { id: 4, name: 'Sam Rivera', licenseNumber: 'DL-4004', licenseCategory: 'C', licenseExpiry: '2027-12-20', contact: '+1 555 0104', safetyScore: 95, status: 'Available' },
];
const seedTrips: Trip[] = [
  { id: 1, source: 'Depot A', destination: 'North Hub', vehicleId: 1, driverId: 1, cargoWeight: 450, distance: 140, status: 'Completed', fuelUsed: 18 },
  { id: 2, source: 'Depot B', destination: 'South Port', vehicleId: 2, driverId: 2, cargoWeight: 800, distance: 220, status: 'Draft', fuelUsed: 0 },
];
const seedMaintenances: Maintenance[] = [
  { id: 1, vehicleId: 3, type: 'Oil Change', description: 'Routine 10k service', cost: 180, date: '2026-07-10', status: 'Open' },
  { id: 2, vehicleId: 1, type: 'Tire Rotation', description: 'Front–rear rotation', cost: 80, date: '2026-06-20', status: 'Closed' },
];
const seedFuelLogs: FuelLog[] = [
  { id: 1, vehicleId: 1, liters: 50, cost: 85, date: '2026-07-01', odometer: 11800 },
  { id: 2, vehicleId: 2, liters: 90, cost: 153, date: '2026-07-03', odometer: 34800 },
  { id: 3, vehicleId: 4, liters: 40, cost: 68, date: '2026-07-08', odometer: 8200 },
];
const seedExpenses: Expense[] = [
  { id: 1, vehicleId: 1, type: 'Toll', amount: 12, date: '2026-07-01', notes: 'Highway toll Depot A→North Hub' },
  { id: 2, vehicleId: 2, type: 'Insurance', amount: 420, date: '2026-07-01', notes: 'Monthly premium' },
  { id: 3, vehicleId: 3, type: 'Repairs', amount: 380, date: '2026-07-10', notes: 'Brake pad replacement' },
];

// ── Utility Helpers ──────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const isExpired = (d: string) => new Date(d) < new Date();
const fmtCurrency = (n: number) => `$${n.toLocaleString()}`;
const fmtNum = (n: number) => n.toLocaleString();

type Section = 'dashboard' | 'vehicles' | 'drivers' | 'trips' | 'maintenance' | 'fuel' | 'expenses' | 'reports';

// ── Pill ─────────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`pill ${cls}`}>{status}</span>;
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: string }) {
  return (
    <article className="stat-card" style={accent ? { borderTop: `3px solid ${accent}` } as React.CSSProperties : {}}>
      <h3>{label}</h3>
      <strong style={accent ? { color: accent } : {}}>{value}</strong>
      <span>{sub}</span>
    </article>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────
function Alert({ msg, onClose }: { msg: string; onClose: () => void }) {
  if (!msg) return null;
  return (
    <div className="db-alert-overlay" onClick={onClose}>
      <div className="db-alert-box" onClick={e => e.stopPropagation()}>
        <div className="db-alert-icon">⚠️</div>
        <p>{msg}</p>
        <button className="primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('transitops_user');
  const user = userRaw ? JSON.parse(userRaw) : { name: 'Admin', role: 'Admin' };

  const [section, setSection] = useState<Section>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [maintenances, setMaintenances] = useState<Maintenance[]>(seedMaintenances);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(seedFuelLogs);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [alert, setAlert] = useState('');

  const showAlert = (msg: string) => setAlert(msg);

  // ── KPIs ──────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const totalV = vehicles.length;
    const activeV = vehicles.filter(v => v.status !== 'Retired').length;
    const availV = vehicles.filter(v => v.status === 'Available').length;
    const inShopV = vehicles.filter(v => v.status === 'In Shop').length;
    const retiredV = vehicles.filter(v => v.status === 'Retired').length;
    const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
    const utilization = totalV > 0 ? Math.round((activeV / totalV) * 100) : 0;
    return { totalV, activeV, availV, inShopV, retiredV, activeTrips, pendingTrips, driversOnDuty, utilization };
  }, [vehicles, drivers, trips]);

  // ── Business Rule: Dispatch ───────────────────────────────────
  const dispatchTrip = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);
    if (!vehicle || vehicle.status !== 'Available') { showAlert('Vehicle is not available for dispatch.'); return; }
    if (!driver || driver.status !== 'Available') { showAlert('Driver is not available for dispatch.'); return; }
    if (isExpired(driver.licenseExpiry)) { showAlert(`Driver ${driver.name}'s license has expired. Cannot dispatch.`); return; }
    if (driver.status === 'Suspended') { showAlert(`Driver ${driver.name} is suspended. Cannot dispatch.`); return; }
    if (trip.cargoWeight > vehicle.capacity) { showAlert(`Cargo (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`); return; }
    setTrips(cur => cur.map(t => t.id === tripId ? { ...t, status: 'Dispatched' } : t));
    setVehicles(cur => cur.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v));
    setDrivers(cur => cur.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' } : d));
  };

  const completeTrip = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    setTrips(cur => cur.map(t => t.id === tripId ? { ...t, status: 'Completed' } : t));
    setVehicles(cur => cur.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
    setDrivers(cur => cur.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
  };

  const cancelTrip = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    setTrips(cur => cur.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t));
    if (trip.status === 'Dispatched') {
      setVehicles(cur => cur.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
      setDrivers(cur => cur.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
    }
  };

  const closeMaintenance = (id: number) => {
    const m = maintenances.find(r => r.id === id);
    if (!m) return;
    setMaintenances(cur => cur.map(r => r.id === id ? { ...r, status: 'Closed' } : r));
    const vehicle = vehicles.find(v => v.id === m.vehicleId);
    if (vehicle && vehicle.status === 'In Shop') {
      setVehicles(cur => cur.map(v => v.id === m.vehicleId ? { ...v, status: 'Available' } : v));
    }
  };

  const handleLogout = () => { localStorage.removeItem('transitops_user'); navigate('/login'); };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚚' },
    { id: 'drivers', label: 'Drivers', icon: '👨‍✈️' },
    { id: 'trips', label: 'Trips', icon: '🗺️' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'fuel', label: 'Fuel Logs', icon: '⛽' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="db-shell">
      <Alert msg={alert} onClose={() => setAlert('')} />

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <span>🚛</span>
          <span>TransitOps</span>
        </div>
        <nav className="db-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`db-nav-item ${section === item.id ? 'active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">{user.name.charAt(0)}</div>
          <div className="db-sidebar-user-info">
            <span className="db-sidebar-name">{user.name}</span>
            <span className="db-sidebar-role">{user.role}</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="db-main">
        {/* Topbar */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-page-title">
              {navItems.find(n => n.id === section)?.icon} {navItems.find(n => n.id === section)?.label}
            </h1>
          </div>
          <div className="db-topbar-right">
            <button className="ghost" onClick={() => navigate('/')}>← Home</button>
            <button className="ghost" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="db-content">
          {section === 'dashboard' && <DashboardView kpi={kpi} vehicles={vehicles} trips={trips} drivers={drivers} maintenances={maintenances} />}
          {section === 'vehicles' && <VehiclesView vehicles={vehicles} setVehicles={setVehicles} maintenances={maintenances} setMaintenances={setMaintenances} showAlert={showAlert} />}
          {section === 'drivers' && <DriversView drivers={drivers} setDrivers={setDrivers} />}
          {section === 'trips' && <TripsView trips={trips} setTrips={setTrips} vehicles={vehicles} drivers={drivers} dispatchTrip={dispatchTrip} completeTrip={completeTrip} cancelTrip={cancelTrip} showAlert={showAlert} />}
          {section === 'maintenance' && <MaintenanceView maintenances={maintenances} setMaintenances={setMaintenances} vehicles={vehicles} setVehicles={setVehicles} closeMaintenance={closeMaintenance} />}
          {section === 'fuel' && <FuelView fuelLogs={fuelLogs} setFuelLogs={setFuelLogs} vehicles={vehicles} />}
          {section === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} vehicles={vehicles} />}
          {section === 'reports' && <ReportsView vehicles={vehicles} trips={trips} fuelLogs={fuelLogs} maintenances={maintenances} expenses={expenses} />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ════════════════════════════════════════════════════════════════
function DashboardView({ kpi, vehicles, trips, drivers, maintenances }: any) {
  const activeTrips = trips.filter((t: Trip) => t.status === 'Dispatched');
  const recentMaint = maintenances.filter((m: Maintenance) => m.status === 'Open');
  const expiringDrivers = drivers.filter((d: Driver) => {
    const days = Math.floor((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 90;
  });

  return (
    <div className="db-section">
      {/* Hero */}
      <div className="hero-card" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow">Operations Overview</p>
          <h2>Keep dispatch, maintenance, and compliance moving.</h2>
          <p>Monitor fleet, drivers, active trips, and vehicle health in real-time.</p>
        </div>
        <div className="hero-badges">
          <span>RBAC Ready</span>
          <span>Audit-Friendly</span>
          <span>Enterprise Scale</span>
        </div>
      </div>

      {/* KPI Grid - Row 1 */}
      <div className="db-kpi-grid">
        <StatCard label="Available Vehicles" value={kpi.availV} sub="ready for dispatch" accent="#16a34a" />
        <StatCard label="In Maintenance" value={kpi.inShopV} sub="vehicles in shop" accent="#d97706" />
        <StatCard label="Retired" value={kpi.retiredV} sub="out of service" accent="#94a3b8" />
        <StatCard label="Active Trips" value={kpi.activeTrips} sub="currently dispatched" accent="#2563eb" />
        <StatCard label="Pending Trips" value={kpi.pendingTrips} sub="awaiting dispatch" accent="#8b5cf6" />
        <StatCard label="Drivers On Duty" value={kpi.driversOnDuty} sub="currently on trip" accent="#0891b2" />
        <StatCard label="Fleet Utilization" value={`${kpi.utilization}%`} sub="active / total vehicles" accent="#059669" />
        <StatCard label="Total Fleet" value={kpi.totalV} sub="registered vehicles" accent="#475569" />
      </div>

      {/* Utilization bar */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header"><h3>Fleet Utilization at a Glance</h3></div>
        <div className="db-util-bars">
          {[
            { label: 'Available', count: kpi.availV, total: kpi.totalV, color: '#16a34a' },
            { label: 'On Trip', count: vehicles.filter((v: Vehicle) => v.status === 'On Trip').length, total: kpi.totalV, color: '#2563eb' },
            { label: 'In Shop', count: kpi.inShopV, total: kpi.totalV, color: '#d97706' },
            { label: 'Retired', count: kpi.retiredV, total: kpi.totalV, color: '#94a3b8' },
          ].map(b => (
            <div key={b.label} className="db-util-row">
              <span className="db-util-label">{b.label}</span>
              <div className="db-util-track">
                <div className="db-util-fill" style={{ width: `${kpi.totalV > 0 ? (b.count / kpi.totalV) * 100 : 0}%`, background: b.color }} />
              </div>
              <span className="db-util-count">{b.count} / {kpi.totalV}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active trips + license alerts */}
      <div className="db-two-col" style={{ marginTop: '1.5rem' }}>
        <div className="panel">
          <div className="panel-header"><h3>🚀 Active Trips</h3></div>
          {activeTrips.length === 0 ? (
            <p className="db-empty">No active trips right now.</p>
          ) : (
            <div className="rows">
              {activeTrips.map((t: Trip) => (
                <div className="card" key={t.id}>
                  <div>
                    <h4>{t.source} → {t.destination}</h4>
                    <p>Vehicle #{t.vehicleId} · Driver #{t.driverId} · {t.cargoWeight} kg</p>
                  </div>
                  <Pill status="Dispatched" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header"><h3>⚠️ License Expiry Alerts</h3></div>
          {expiringDrivers.length === 0 ? (
            <p className="db-empty">All licenses valid for 90+ days.</p>
          ) : (
            <div className="rows">
              {expiringDrivers.map((d: Driver) => {
                const days = Math.floor((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
                return (
                  <div className="card" key={d.id} style={{ borderLeft: '3px solid #d97706' }}>
                    <div>
                      <h4>{d.name}</h4>
                      <p>{d.licenseNumber} · Expires {d.licenseExpiry}</p>
                    </div>
                    <span className="pill on-trip">{days}d left</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Open maintenance */}
      {recentMaint.length > 0 && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-header"><h3>🔧 Open Maintenance Records</h3></div>
          <div className="rows">
            {recentMaint.map((m: Maintenance) => (
              <div className="card" key={m.id}>
                <div>
                  <h4>{m.type} — Vehicle #{m.vehicleId}</h4>
                  <p>{m.description} · {m.date}</p>
                </div>
                <div className="card-actions">
                  <Pill status="Open" />
                  <span className="cost-badge">{fmtCurrency(m.cost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// VEHICLES VIEW
// ════════════════════════════════════════════════════════════════
function VehiclesView({ vehicles, setVehicles, maintenances, setMaintenances, showAlert }: any) {
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ registration: '', name: '', model: '', type: 'Van', capacity: '', odometer: '', cost: '' });
  const [formErr, setFormErr] = useState('');

  const filtered = useMemo(() => vehicles.filter((v: Vehicle) => {
    const statusOk = filter === 'All' || v.status === filter;
    const typeOk = typeFilter === 'All' || v.type === typeFilter;
    const searchOk = !search || v.registration.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase());
    return statusOk && typeOk && searchOk;
  }), [vehicles, filter, typeFilter, search]);

  const addVehicle = () => {
    if (!form.registration || !form.name || !form.capacity) { setFormErr('Registration, Name, and Capacity are required.'); return; }
    if (vehicles.some((v: Vehicle) => v.registration === form.registration)) { setFormErr('Registration number must be unique.'); return; }
    const id = Math.max(0, ...vehicles.map((v: Vehicle) => v.id)) + 1;
    setVehicles((cur: Vehicle[]) => [...cur, { id, ...form, capacity: +form.capacity, odometer: +form.odometer || 0, cost: +form.cost || 0, status: 'Available' as VehicleStatus }]);
    setForm({ registration: '', name: '', model: '', type: 'Van', capacity: '', odometer: '', cost: '' });
    setFormErr('');
    setShowForm(false);
  };

  const retireVehicle = (id: number) => {
    const v = vehicles.find((x: Vehicle) => x.id === id);
    if (v?.status === 'On Trip') { showAlert('Cannot retire a vehicle that is On Trip.'); return; }
    setVehicles((cur: Vehicle[]) => cur.map((v: Vehicle) => v.id === id ? { ...v, status: 'Retired' } : v));
  };

  const sendToShop = (id: number) => {
    const v = vehicles.find((x: Vehicle) => x.id === id);
    if (v?.status === 'On Trip') { showAlert('Cannot send a vehicle On Trip to maintenance.'); return; }
    setVehicles((cur: Vehicle[]) => cur.map((v: Vehicle) => v.id === id ? { ...v, status: 'In Shop' } : v));
    const newId = Math.max(0, ...maintenances.map((m: Maintenance) => m.id)) + 1;
    setMaintenances((cur: Maintenance[]) => [...cur, { id: newId, vehicleId: id, type: 'Unscheduled', description: 'Manual maintenance entry', cost: 0, date: today, status: 'Open' }]);
  };

  const exportCSV = () => {
    const rows = [['ID', 'Registration', 'Name', 'Model', 'Type', 'Capacity', 'Odometer', 'Cost', 'Status'], ...vehicles.map((v: Vehicle) => [v.id, v.registration, v.name, v.model, v.type, v.capacity, v.odometer, v.cost, v.status])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'vehicles.csv'; a.click();
  };

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div className="db-search-bar">
          <input placeholder="Search registration or name…" value={search} onChange={e => setSearch(e.target.value)} className="db-search-input" />
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option>Van</option><option>Bus</option><option>Truck</option>
          </select>
        </div>
        <div className="db-section-actions">
          <button className="ghost" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Vehicle</button>
        </div>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Register New Vehicle</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Registration *</label><input value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} /></div>
            <div className="db-field"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="db-field"><label>Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
            <div className="db-field"><label>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Van</option><option>Bus</option><option>Truck</option></select></div>
            <div className="db-field"><label>Max Capacity (kg) *</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
            <div className="db-field"><label>Odometer (km)</label><input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} /></div>
            <div className="db-field"><label>Acquisition Cost ($)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={addVehicle}>Save Vehicle</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Vehicle Registry ({filtered.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Registration</th><th>Vehicle</th><th>Type</th><th>Capacity</th><th>Odometer</th><th>Acq. Cost</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((v: Vehicle) => (
                <tr key={v.id}>
                  <td><strong>{v.registration}</strong></td>
                  <td>{v.name}<br /><small style={{ color: '#94a3b8' }}>{v.model}</small></td>
                  <td>{v.type}</td>
                  <td>{fmtNum(v.capacity)} kg</td>
                  <td>{fmtNum(v.odometer)} km</td>
                  <td>{fmtCurrency(v.cost)}</td>
                  <td><Pill status={v.status} /></td>
                  <td>
                    <div className="db-row-actions">
                      {v.status === 'Available' && <button className="db-action-btn warn" onClick={() => sendToShop(v.id)}>Maintenance</button>}
                      {v.status !== 'Retired' && v.status !== 'On Trip' && <button className="db-action-btn danger" onClick={() => retireVehicle(v.id)}>Retire</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DRIVERS VIEW
// ════════════════════════════════════════════════════════════════
function DriversView({ drivers, setDrivers }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '', contact: '', safetyScore: '' });
  const [formErr, setFormErr] = useState('');

  const filtered = useMemo(() => drivers.filter((d: Driver) => {
    const statusOk = filter === 'All' || d.status === filter;
    const searchOk = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    return statusOk && searchOk;
  }), [drivers, filter, search]);

  const addDriver = () => {
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) { setFormErr('Name, License Number, and Expiry are required.'); return; }
    const id = Math.max(0, ...drivers.map((d: Driver) => d.id)) + 1;
    setDrivers((cur: Driver[]) => [...cur, { id, ...form, safetyScore: +form.safetyScore || 100, status: 'Available' as DriverStatus }]);
    setForm({ name: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '', contact: '', safetyScore: '' });
    setFormErr(''); setShowForm(false);
  };

  const suspendDriver = (id: number) => setDrivers((cur: Driver[]) => cur.map((d: Driver) => d.id === id ? { ...d, status: 'Suspended' } : d));
  const activateDriver = (id: number) => setDrivers((cur: Driver[]) => cur.map((d: Driver) => d.id === id ? { ...d, status: 'Available' } : d));

  const exportCSV = () => {
    const rows = [['ID', 'Name', 'License', 'Category', 'Expiry', 'Contact', 'Safety Score', 'Status'], ...drivers.map((d: Driver) => [d.id, d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiry, d.contact, d.safetyScore, d.status])];
    const csv = rows.map((r: any[]) => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'drivers.csv'; a.click();
  };

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div className="db-search-bar">
          <input placeholder="Search name or license…" value={search} onChange={e => setSearch(e.target.value)} className="db-search-input" />
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option>Available</option><option>On Trip</option><option>Off Duty</option><option>Suspended</option>
          </select>
        </div>
        <div className="db-section-actions">
          <button className="ghost" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Driver</button>
        </div>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Register New Driver</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="db-field"><label>License Number *</label><input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} /></div>
            <div className="db-field"><label>Category</label><select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })}><option>B</option><option>C</option><option>D</option><option>E</option></select></div>
            <div className="db-field"><label>Expiry Date *</label><input type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} /></div>
            <div className="db-field"><label>Contact</label><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
            <div className="db-field"><label>Safety Score</label><input type="number" min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={addDriver}>Save Driver</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Driver Registry ({filtered.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>License</th><th>Category</th><th>Expiry</th><th>Contact</th><th>Safety Score</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((d: Driver) => {
                const expired = isExpired(d.licenseExpiry);
                return (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.licenseNumber}</td>
                    <td>{d.licenseCategory}</td>
                    <td><span style={{ color: expired ? '#dc2626' : 'inherit', fontWeight: expired ? 700 : 400 }}>{d.licenseExpiry} {expired && '⚠️'}</span></td>
                    <td>{d.contact}</td>
                    <td>
                      <div className="db-score-bar">
                        <div className="db-score-fill" style={{ width: `${d.safetyScore}%`, background: d.safetyScore >= 80 ? '#16a34a' : d.safetyScore >= 60 ? '#d97706' : '#dc2626' }} />
                        <span>{d.safetyScore}%</span>
                      </div>
                    </td>
                    <td><Pill status={d.status} /></td>
                    <td>
                      <div className="db-row-actions">
                        {d.status !== 'Suspended' && d.status !== 'On Trip' && <button className="db-action-btn danger" onClick={() => suspendDriver(d.id)}>Suspend</button>}
                        {d.status === 'Suspended' && <button className="db-action-btn success" onClick={() => activateDriver(d.id)}>Activate</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TRIPS VIEW
// ════════════════════════════════════════════════════════════════
function TripsView({ trips, setTrips, vehicles, drivers, dispatchTrip, completeTrip, cancelTrip, showAlert }: any) {
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
  const [formErr, setFormErr] = useState('');

  const filtered = useMemo(() => trips.filter((t: Trip) => filter === 'All' || t.status === filter), [trips, filter]);

  const availVehicles = vehicles.filter((v: Vehicle) => v.status === 'Available');
  const availDrivers = drivers.filter((d: Driver) => d.status === 'Available' && !isExpired(d.licenseExpiry) && d.status !== 'Suspended');

  const createTrip = () => {
    if (!form.source || !form.destination || !form.vehicleId || !form.driverId || !form.cargoWeight) { setFormErr('All fields except Distance are required.'); return; }
    const vehicle = vehicles.find((v: Vehicle) => v.id === +form.vehicleId);
    if (vehicle && +form.cargoWeight > vehicle.capacity) { setFormErr(`Cargo (${form.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`); return; }
    const id = Math.max(0, ...trips.map((t: Trip) => t.id)) + 1;
    setTrips((cur: Trip[]) => [...cur, { id, ...form, vehicleId: +form.vehicleId, driverId: +form.driverId, cargoWeight: +form.cargoWeight, distance: +form.distance || 0, status: 'Draft' as TripStatus }]);
    setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
    setFormErr(''); setShowForm(false);
  };

  const exportCSV = () => {
    const rows = [['ID', 'Source', 'Destination', 'Vehicle', 'Driver', 'Cargo (kg)', 'Distance (km)', 'Status'], ...trips.map((t: Trip) => [t.id, t.source, t.destination, t.vehicleId, t.driverId, t.cargoWeight, t.distance, t.status])];
    const csv = rows.map((r: any[]) => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'trips.csv'; a.click();
  };

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div className="db-search-bar">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option>Draft</option><option>Dispatched</option><option>Completed</option><option>Cancelled</option>
          </select>
        </div>
        <div className="db-section-actions">
          <button className="ghost" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="primary" onClick={() => setShowForm(!showForm)}>+ New Trip</button>
        </div>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Create New Trip</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Source *</label><input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
            <div className="db-field"><label>Destination *</label><input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div className="db-field"><label>Vehicle *</label>
              <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {availVehicles.map((v: Vehicle) => <option key={v.id} value={v.id}>{v.registration} – {v.name} (cap: {v.capacity} kg)</option>)}
              </select>
            </div>
            <div className="db-field"><label>Driver *</label>
              <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver…</option>
                {availDrivers.map((d: Driver) => <option key={d.id} value={d.id}>{d.name} – {d.licenseNumber}</option>)}
              </select>
            </div>
            <div className="db-field"><label>Cargo Weight (kg) *</label><input type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} /></div>
            <div className="db-field"><label>Planned Distance (km)</label><input type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={createTrip}>Create Trip</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Trip Management ({filtered.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo</th><th>Distance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((t: Trip) => (
                <tr key={t.id}>
                  <td><strong>{t.source} → {t.destination}</strong></td>
                  <td>#{t.vehicleId}</td>
                  <td>#{t.driverId}</td>
                  <td>{t.cargoWeight} kg</td>
                  <td>{t.distance} km</td>
                  <td><Pill status={t.status} /></td>
                  <td>
                    <div className="db-row-actions">
                      {t.status === 'Draft' && <><button className="db-action-btn success" onClick={() => dispatchTrip(t.id)}>Dispatch</button><button className="db-action-btn danger" onClick={() => cancelTrip(t.id)}>Cancel</button></>}
                      {t.status === 'Dispatched' && <><button className="db-action-btn" onClick={() => completeTrip(t.id)}>Complete</button><button className="db-action-btn danger" onClick={() => cancelTrip(t.id)}>Cancel</button></>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAINTENANCE VIEW
// ════════════════════════════════════════════════════════════════
function MaintenanceView({ maintenances, setMaintenances, vehicles, setVehicles, closeMaintenance }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: '', description: '', cost: '', date: today });
  const [formErr, setFormErr] = useState('');

  const addMaintenance = () => {
    if (!form.vehicleId || !form.type) { setFormErr('Vehicle and Type are required.'); return; }
    const id = Math.max(0, ...maintenances.map((m: Maintenance) => m.id)) + 1;
    setMaintenances((cur: Maintenance[]) => [...cur, { id, vehicleId: +form.vehicleId, type: form.type, description: form.description, cost: +form.cost || 0, date: form.date || today, status: 'Open' as MaintenanceStatus }]);
    setVehicles((cur: Vehicle[]) => cur.map((v: Vehicle) => v.id === +form.vehicleId ? { ...v, status: 'In Shop' } : v));
    setForm({ vehicleId: '', type: '', description: '', cost: '', date: today });
    setFormErr(''); setShowForm(false);
  };

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div />
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Maintenance</button>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Create Maintenance Record</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Vehicle *</label>
              <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {vehicles.filter((v: Vehicle) => v.status !== 'Retired').map((v: Vehicle) => <option key={v.id} value={v.id}>{v.registration} – {v.name}</option>)}
              </select>
            </div>
            <div className="db-field"><label>Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="">Select type…</option>
                <option>Oil Change</option><option>Tire Replacement</option><option>Engine Service</option><option>Brake Repair</option><option>Electrical</option><option>Unscheduled</option>
              </select>
            </div>
            <div className="db-field"><label>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="db-field"><label>Cost ($)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
            <div className="db-field"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={addMaintenance}>Save Record</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Maintenance Log ({maintenances.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Cost</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {maintenances.map((m: Maintenance) => {
                const v = vehicles.find((x: Vehicle) => x.id === m.vehicleId);
                return (
                  <tr key={m.id}>
                    <td><strong>{v?.registration || `#${m.vehicleId}`}</strong><br /><small style={{ color: '#94a3b8' }}>{v?.name}</small></td>
                    <td>{m.type}</td>
                    <td>{m.description}</td>
                    <td>{fmtCurrency(m.cost)}</td>
                    <td>{m.date}</td>
                    <td><Pill status={m.status} /></td>
                    <td>{m.status === 'Open' && <button className="db-action-btn success" onClick={() => closeMaintenance(m.id)}>Close</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// FUEL VIEW
// ════════════════════════════════════════════════════════════════
function FuelView({ fuelLogs, setFuelLogs, vehicles }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: today, odometer: '' });
  const [formErr, setFormErr] = useState('');

  const addFuelLog = () => {
    if (!form.vehicleId || !form.liters || !form.cost) { setFormErr('Vehicle, Liters, and Cost are required.'); return; }
    const id = Math.max(0, ...fuelLogs.map((f: FuelLog) => f.id)) + 1;
    setFuelLogs((cur: FuelLog[]) => [...cur, { id, vehicleId: +form.vehicleId, liters: +form.liters, cost: +form.cost, date: form.date || today, odometer: +form.odometer || 0 }]);
    setForm({ vehicleId: '', liters: '', cost: '', date: today, odometer: '' });
    setFormErr(''); setShowForm(false);
  };

  const total = fuelLogs.reduce((s: number, f: FuelLog) => s + f.cost, 0);

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div className="db-kpi-mini">
          <div className="db-kpi-mini-card"><span>Total Fuel Cost</span><strong>{fmtCurrency(total)}</strong></div>
          <div className="db-kpi-mini-card"><span>Total Logs</span><strong>{fuelLogs.length}</strong></div>
          <div className="db-kpi-mini-card"><span>Total Liters</span><strong>{fuelLogs.reduce((s: number, f: FuelLog) => s + f.liters, 0).toFixed(0)} L</strong></div>
        </div>
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ Log Fuel</button>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Add Fuel Log</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Vehicle *</label>
              <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {vehicles.filter((v: Vehicle) => v.status !== 'Retired').map((v: Vehicle) => <option key={v.id} value={v.id}>{v.registration} – {v.name}</option>)}
              </select>
            </div>
            <div className="db-field"><label>Liters *</label><input type="number" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} /></div>
            <div className="db-field"><label>Cost ($) *</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
            <div className="db-field"><label>Odometer (km)</label><input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} /></div>
            <div className="db-field"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={addFuelLog}>Save Log</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Fuel Logs ({fuelLogs.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Date</th><th>Liters</th><th>Cost</th><th>Odometer</th><th>$/Liter</th></tr></thead>
            <tbody>
              {fuelLogs.map((f: FuelLog) => {
                const v = vehicles.find((x: Vehicle) => x.id === f.vehicleId);
                return (
                  <tr key={f.id}>
                    <td><strong>{v?.registration || `#${f.vehicleId}`}</strong></td>
                    <td>{f.date}</td>
                    <td>{f.liters} L</td>
                    <td>{fmtCurrency(f.cost)}</td>
                    <td>{fmtNum(f.odometer)} km</td>
                    <td>{(f.cost / f.liters).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// EXPENSES VIEW
// ════════════════════════════════════════════════════════════════
function ExpensesView({ expenses, setExpenses, vehicles }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: 'Toll', amount: '', date: today, notes: '' });
  const [formErr, setFormErr] = useState('');

  const addExpense = () => {
    if (!form.vehicleId || !form.amount) { setFormErr('Vehicle and Amount are required.'); return; }
    const id = Math.max(0, ...expenses.map((e: Expense) => e.id)) + 1;
    setExpenses((cur: Expense[]) => [...cur, { id, vehicleId: +form.vehicleId, type: form.type, amount: +form.amount, date: form.date || today, notes: form.notes }]);
    setForm({ vehicleId: '', type: 'Toll', amount: '', date: today, notes: '' });
    setFormErr(''); setShowForm(false);
  };

  const total = expenses.reduce((s: number, e: Expense) => s + e.amount, 0);
  const byType = expenses.reduce((acc: Record<string, number>, e: Expense) => { acc[e.type] = (acc[e.type] || 0) + e.amount; return acc; }, {} as Record<string, number>);

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div className="db-kpi-mini">
          <div className="db-kpi-mini-card"><span>Total Expenses</span><strong>{fmtCurrency(total)}</strong></div>
          {Object.entries(byType).map(([type, amt]) => <div className="db-kpi-mini-card" key={type}><span>{type}</span><strong>{fmtCurrency(amt as number)}</strong></div>)}
        </div>
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Expense</button>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Record Expense</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Vehicle *</label>
              <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {vehicles.map((v: Vehicle) => <option key={v.id} value={v.id}>{v.registration} – {v.name}</option>)}
              </select>
            </div>
            <div className="db-field"><label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Toll</option><option>Repairs</option><option>Insurance</option><option>Maintenance</option><option>Miscellaneous</option>
              </select>
            </div>
            <div className="db-field"><label>Amount ($) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="db-field"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="db-field" style={{ gridColumn: 'span 2' }}><label>Notes</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="db-form-footer"><button className="primary" onClick={addExpense}>Save Expense</button><button className="ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Expense Records ({expenses.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Type</th><th>Amount</th><th>Date</th><th>Notes</th></tr></thead>
            <tbody>
              {expenses.map((e: Expense) => {
                const v = vehicles.find((x: Vehicle) => x.id === e.vehicleId);
                return (
                  <tr key={e.id}>
                    <td><strong>{v?.registration || `#${e.vehicleId}`}</strong></td>
                    <td><span className="pill">{e.type}</span></td>
                    <td><span className="cost-badge">{fmtCurrency(e.amount)}</span></td>
                    <td>{e.date}</td>
                    <td style={{ color: '#94a3b8' }}>{e.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// REPORTS VIEW
// ════════════════════════════════════════════════════════════════
function ReportsView({ vehicles, trips, fuelLogs, maintenances, expenses }: any) {
  const totalFuelCost = fuelLogs.reduce((s: number, f: FuelLog) => s + f.cost, 0);
  const totalMaintCost = maintenances.reduce((s: number, m: Maintenance) => s + m.cost, 0);
  const totalExpenses = expenses.reduce((s: number, e: Expense) => s + e.amount, 0);
  const totalOpCost = totalFuelCost + totalMaintCost + totalExpenses;

  const totalDistanceByTrip = trips.filter((t: Trip) => t.status === 'Completed').reduce((s: number, t: Trip) => s + t.distance, 0);
  const totalLiters = fuelLogs.reduce((s: number, f: FuelLog) => s + f.liters, 0);
  const fuelEfficiency = totalLiters > 0 ? (totalDistanceByTrip / totalLiters).toFixed(2) : '-';

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v: Vehicle) => v.status !== 'Retired').length;
  const fleetUtil = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  const vehicleROI = vehicles.map((v: Vehicle) => {
    const vFuel = fuelLogs.filter((f: FuelLog) => f.vehicleId === v.id).reduce((s: number, f: FuelLog) => s + f.cost, 0);
    const vMaint = maintenances.filter((m: Maintenance) => m.vehicleId === v.id).reduce((s: number, m: Maintenance) => s + m.cost, 0);
    const vRevenue = trips.filter((t: Trip) => t.vehicleId === v.id && t.status === 'Completed').length * 1200;
    const roi = v.cost > 0 ? (((vRevenue - vFuel - vMaint) / v.cost) * 100).toFixed(1) : '0';
    return { ...v, vFuel, vMaint, vRevenue, roi };
  });

  const exportCSV = () => {
    const rows = [
      ['Report: Operational Costs'],
      ['Fuel Cost', totalFuelCost],
      ['Maintenance Cost', totalMaintCost],
      ['Other Expenses', totalExpenses],
      ['Total Operational Cost', totalOpCost],
      [],
      ['Report: Fleet Utilization'],
      ['Total Vehicles', totalVehicles],
      ['Active Vehicles', activeVehicles],
      ['Fleet Utilization %', fleetUtil + '%'],
      [],
      ['Report: Vehicle ROI'],
      ['Registration', 'Revenue', 'Fuel', 'Maintenance', 'Acquisition', 'ROI %'],
      ...vehicleROI.map((v: any) => [v.registration, v.vRevenue, v.vFuel, v.vMaint, v.cost, v.roi + '%']),
    ];
    const csv = rows.map((r: any[]) => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'transitops-report.csv'; a.click();
  };

  return (
    <div className="db-section">
      <div className="db-section-header">
        <div />
        <button className="primary" onClick={exportCSV}>⬇ Export Full Report (CSV)</button>
      </div>

      {/* Operational Cost Summary */}
      <div className="db-kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Fuel Cost" value={fmtCurrency(totalFuelCost)} sub="total fuel spend" accent="#2563eb" />
        <StatCard label="Maintenance Cost" value={fmtCurrency(totalMaintCost)} sub="total maintenance" accent="#d97706" />
        <StatCard label="Other Expenses" value={fmtCurrency(totalExpenses)} sub="tolls, insurance, misc" accent="#8b5cf6" />
        <StatCard label="Total Op. Cost" value={fmtCurrency(totalOpCost)} sub="fuel + maintenance + expenses" accent="#dc2626" />
        <StatCard label="Fuel Efficiency" value={fuelEfficiency === '-' ? '-' : `${fuelEfficiency} km/L`} sub="completed trips / liters used" accent="#059669" />
        <StatCard label="Fleet Utilization" value={`${fleetUtil}%`} sub="active / total vehicles" accent="#0891b2" />
        <StatCard label="Completed Trips" value={trips.filter((t: Trip) => t.status === 'Completed').length} sub="revenue-generating trips" accent="#16a34a" />
        <StatCard label="Total Distance" value={`${fmtNum(totalDistanceByTrip)} km`} sub="completed trip distance" accent="#475569" />
      </div>

      {/* Operational Cost bar chart (CSS) */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header"><h3>Cost Breakdown</h3></div>
        <div className="db-util-bars">
          {[
            { label: 'Fuel', amount: totalFuelCost, color: '#2563eb' },
            { label: 'Maintenance', amount: totalMaintCost, color: '#d97706' },
            { label: 'Expenses', amount: totalExpenses, color: '#8b5cf6' },
          ].map(b => (
            <div key={b.label} className="db-util-row">
              <span className="db-util-label">{b.label}</span>
              <div className="db-util-track">
                <div className="db-util-fill" style={{ width: totalOpCost > 0 ? `${(b.amount / totalOpCost) * 100}%` : '0%', background: b.color }} />
              </div>
              <span className="db-util-count">{fmtCurrency(b.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle ROI Table */}
      <div className="panel">
        <div className="panel-header"><h3>Vehicle ROI Analysis</h3><small style={{ color: '#94a3b8', fontSize: '0.78rem' }}>ROI = (Revenue − Fuel − Maintenance) / Acquisition Cost × 100</small></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Revenue (est.)</th><th>Fuel Cost</th><th>Maint. Cost</th><th>Acq. Cost</th><th>ROI %</th></tr></thead>
            <tbody>
              {vehicleROI.map((v: any) => (
                <tr key={v.id}>
                  <td><strong>{v.registration}</strong><br /><small style={{ color: '#94a3b8' }}>{v.name}</small></td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmtCurrency(v.vRevenue)}</td>
                  <td>{fmtCurrency(v.vFuel)}</td>
                  <td>{fmtCurrency(v.vMaint)}</td>
                  <td>{fmtCurrency(v.cost)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: +v.roi > 0 ? '#16a34a' : '#dc2626' }}>
                      {v.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

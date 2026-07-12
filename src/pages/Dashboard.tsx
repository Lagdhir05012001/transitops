import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  DollarSign,
  TrendingUp,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';


// ── Types ────────────────────────────────────────────────────────
type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
type MaintenanceStatus = 'Open' | 'Closed';

interface Vehicle {
  id: number; registration: string; name: string; model: string;
  type: 'Van' | 'Bus' | 'Truck'; capacity: number; odometer: number;
  cost: number; status: VehicleStatus; region: string;
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

// ── Alert Modal ───────────────────────────────────────────────────
function Alert({ msg, onClose }: { msg: string; onClose: () => void }) {
  if (!msg) return null;
  return (
    <div className="db-alert-overlay" onClick={onClose}>
      <div className="db-alert-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertTriangle size={36} style={{ color: '#d97706' }} />
        </div>
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(true);

  // Dashboard Filters State
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  const [kpisState, setKpisState] = useState<any>({
    totalV: 0,
    activeV: 0,
    availV: 0,
    inShopV: 0,
    retiredV: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    utilization: 0
  });

  const showAlert = (msg: string) => setAlert(msg);

  // ── Role Authorization Helper ──────────────────────────────────
  const isAuthorized = (action: 'manage_vehicles' | 'manage_drivers' | 'manage_trips' | 'manage_maintenance' | 'manage_fuel' | 'manage_expenses') => {
    const role = user.role;
    if (role === 'Admin') return true;

    switch (action) {
      case 'manage_vehicles':
      case 'manage_maintenance':
        return role === 'Fleet Manager';
      case 'manage_drivers':
        return role === 'Safety Officer';
      case 'manage_trips':
        return role === 'Dispatcher';
      case 'manage_fuel':
        return role === 'Fleet Manager' || role === 'Dispatcher';
      case 'manage_expenses':
        return role === 'Financial Analyst' || role === 'Fleet Manager';
      default:
        return false;
    }
  };

  // Fetch only authorized databases from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch dashboard KPIs with filters
      try {
        const kpisRes = await axios.get(`${API_URL}/dashboard/kpis`, {
          headers,
          params: { type: filterType, status: filterStatus, region: filterRegion }
        });
        if (kpisRes.data.success) {
          setKpisState(kpisRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard KPIs', err);
      }

      const role = user.role;
      const promises: Promise<any>[] = [];
      const keys: string[] = [];

      const shouldFetchVehicles = true;
      const shouldFetchDrivers = role === 'Admin' || role === 'Safety Officer' || role === 'Dispatcher';
      const shouldFetchTrips = true;
      const shouldFetchMaintenance = role === 'Admin' || role === 'Fleet Manager' || role === 'Financial Analyst';
      const shouldFetchFuel = role === 'Admin' || role === 'Fleet Manager' || role === 'Dispatcher' || role === 'Financial Analyst';
      const shouldFetchExpenses = role === 'Admin' || role === 'Financial Analyst' || role === 'Fleet Manager';

      if (shouldFetchVehicles) {
        promises.push(axios.get(`${API_URL}/vehicles`, { headers }));
        keys.push('vehicles');
      }
      if (shouldFetchDrivers) {
        promises.push(axios.get(`${API_URL}/drivers`, { headers }));
        keys.push('drivers');
      }
      if (shouldFetchTrips) {
        promises.push(axios.get(`${API_URL}/trips`, { headers }));
        keys.push('trips');
      }
      if (shouldFetchMaintenance) {
        promises.push(axios.get(`${API_URL}/maintenance`, { headers }));
        keys.push('maintenance');
      }
      if (shouldFetchFuel) {
        promises.push(axios.get(`${API_URL}/fuel`, { headers }));
        keys.push('fuel');
      }
      if (shouldFetchExpenses) {
        promises.push(axios.get(`${API_URL}/expenses`, { headers }));
        keys.push('expenses');
      }

      const results = await Promise.all(promises);
      results.forEach((res, idx) => {
        const key = keys[idx];
        if (res.data.success) {
          if (key === 'vehicles') setVehicles(res.data.data);
          if (key === 'drivers') setDrivers(res.data.data);
          if (key === 'trips') setTrips(res.data.data);
          if (key === 'maintenance') setMaintenances(res.data.data);
          if (key === 'fuel') setFuelLogs(res.data.data);
          if (key === 'expenses') setExpenses(res.data.data);
        }
      });
    } catch (err: any) {
      showAlert('Failed to synchronize data with backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [section, filterType, filterStatus, filterRegion]);

  // ── Business Rule Actions ────────────────────────────────────
  const dispatchTrip = async (tripId: number) => {
    if (!isAuthorized('manage_trips')) {
      showAlert('Access Denied: Only Dispatchers or Admins can dispatch trips.');
      return;
    }
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);
    if (!vehicle || vehicle.status !== 'Available') { showAlert('Selected vehicle is not available for dispatch.'); return; }
    if (!driver) return;
    if (driver.status === 'Suspended') { showAlert(`Driver ${driver.name} is suspended. Cannot dispatch.`); return; }
    if (isExpired(driver.licenseExpiry)) { showAlert(`Driver ${driver.name}'s license has expired. Cannot dispatch.`); return; }
    if (driver.status !== 'Available') { showAlert('Selected driver is not available for dispatch.'); return; }
    if (trip.cargoWeight > vehicle.capacity) { showAlert(`Cargo (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`); return; }


    try {
      const res = await axios.post(`${API_URL}/trips/${tripId}/dispatch`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err: any) {
      showAlert(err.response?.data?.errors?.[0] || 'Dispatch operation failed.');
    }
  };

  const completeTrip = async (tripId: number, fuelUsed: number = 0) => {
    if (!isAuthorized('manage_trips')) {
      showAlert('Access Denied: Only Dispatchers or Admins can complete trips.');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/trips/${tripId}/complete`, { fuelUsed });
      if (res.data.success) {
        fetchData();
      }
    } catch (err: any) {
      showAlert('Failed to complete trip.');
    }
  };

  const cancelTrip = async (tripId: number) => {
    if (!isAuthorized('manage_trips')) {
      showAlert('Access Denied: Only Dispatchers or Admins can cancel trips.');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/trips/${tripId}/cancel`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err: any) {
      showAlert('Failed to cancel trip.');
    }
  };

  const closeMaintenance = async (id: number) => {
    if (!isAuthorized('manage_maintenance')) {
      showAlert('Access Denied: Only Fleet Managers or Admins can close maintenance logs.');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/maintenance/${id}/close`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err: any) {
      showAlert('Failed to close maintenance.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('transitops_user');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const navItems: { id: Section; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'trips', label: 'Trips', icon: Route },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'dashboard') return true;
    if (item.id === 'vehicles') return user.role === 'Admin' || user.role === 'Fleet Manager';
    if (item.id === 'drivers') return user.role === 'Admin' || user.role === 'Safety Officer';
    if (item.id === 'trips') return user.role === 'Admin' || user.role === 'Dispatcher';
    if (item.id === 'maintenance') return user.role === 'Admin' || user.role === 'Fleet Manager';
    if (item.id === 'fuel') return user.role === 'Admin' || user.role === 'Fleet Manager' || user.role === 'Dispatcher' || user.role === 'Financial Analyst';
    if (item.id === 'expenses') return user.role === 'Admin' || user.role === 'Financial Analyst' || user.role === 'Fleet Manager';
    if (item.id === 'reports') return user.role === 'Admin' || user.role === 'Fleet Manager' || user.role === 'Dispatcher' || user.role === 'Financial Analyst';
    return false;
  });

  return (
    <div className="db-shell">
      <Alert msg={alert} onClose={() => setAlert('')} />

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <Truck className="db-sidebar-brand-icon" size={24} style={{ color: 'var(--primary)', marginRight: '8px' }} />
          <span>TransitOps</span>
        </div>
        <nav className="db-sidebar-nav">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`db-nav-item ${section === item.id ? 'active' : ''}`}
                onClick={() => setSection(item.id)}
              >
                <span className="db-nav-icon"><Icon size={18} /></span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">{user.name?.charAt(0) || 'U'}</div>
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
            <h1 className="db-page-title" style={{ display: 'flex', alignItems: 'center' }}>
              {(() => {
                const ItemIcon = navItems.find(n => n.id === section)?.icon;
                return ItemIcon ? <ItemIcon size={24} style={{ marginRight: '8px', color: 'var(--primary)' }} /> : null;
              })()}
              {navItems.find(n => n.id === section)?.label}
            </h1>
          </div>
          <div className="db-topbar-right">
            <button className="ghost" onClick={() => navigate('/')}>← Home</button>
            <button className="ghost" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="db-content">
          {loading ? (
            <p className="db-empty">Synchronizing database tables with SQLite...</p>
          ) : (
            <>
              {section === 'dashboard' && (
                <DashboardView
                  kpi={kpisState}
                  vehicles={vehicles}
                  trips={trips}
                  drivers={drivers}
                  maintenances={maintenances}
                  expenses={expenses}
                  user={user}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  filterRegion={filterRegion}
                  setFilterRegion={setFilterRegion}
                />
              )}
              {section === 'vehicles' && <VehiclesView vehicles={vehicles} reloadData={fetchData} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'drivers' && <DriversView drivers={drivers} reloadData={fetchData} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'trips' && <TripsView trips={trips} reloadData={fetchData} vehicles={vehicles} drivers={drivers} dispatchTrip={dispatchTrip} completeTrip={completeTrip} cancelTrip={cancelTrip} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'maintenance' && <MaintenanceView maintenances={maintenances} reloadData={fetchData} vehicles={vehicles} closeMaintenance={closeMaintenance} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'fuel' && <FuelView fuelLogs={fuelLogs} reloadData={fetchData} vehicles={vehicles} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'expenses' && <ExpensesView expenses={expenses} reloadData={fetchData} vehicles={vehicles} isAuthorized={isAuthorized} showAlert={showAlert} />}
              {section === 'reports' && <ReportsView vehicles={vehicles} trips={trips} fuelLogs={fuelLogs} maintenances={maintenances} expenses={expenses} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Views ──
function DashboardView({
  kpi,
  vehicles,
  trips,
  drivers,
  maintenances,
  expenses,
  user,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterRegion,
  setFilterRegion
}: any) {
  // Identify the set of vehicle IDs matching the selected filters
  const filteredVehicleIds = useMemo(() => {
    const ids = vehicles
      .filter((v: Vehicle) => {
        const typeOk = filterType === 'All' || v.type === filterType;
        const statusOk = filterStatus === 'All' || v.status === filterStatus;
        const regionOk = filterRegion === 'All' || v.region === filterRegion;
        return typeOk && statusOk && regionOk;
      })
      .map((v: Vehicle) => v.id);
    return new Set(ids);
  }, [vehicles, filterType, filterStatus, filterRegion]);

  const regions = useMemo(() => {
    const list = vehicles.map((v: Vehicle) => v.region).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }, [vehicles]);

  const activeTrips = trips.filter((t: Trip) => t.status === 'Dispatched' && filteredVehicleIds.has(t.vehicleId));
  const recentMaint = maintenances.filter((m: Maintenance) => m.status === 'Open' && filteredVehicleIds.has(m.vehicleId));
  
  const expiringDrivers = useMemo(() => {
    const baseExpiring = drivers.filter((d: Driver) => {
      const days = Math.floor((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 90;
    });

    if (filterType !== 'All' || filterStatus !== 'All' || filterRegion !== 'All') {
      return baseExpiring.filter((d: Driver) => {
        const driverTrips = trips.filter((t: Trip) => t.driverId === d.id);
        return driverTrips.some((t: Trip) => filteredVehicleIds.has(t.vehicleId));
      });
    }
    return baseExpiring;
  }, [drivers, trips, filteredVehicleIds, filterType, filterStatus, filterRegion]);

  const recentExpenses = (expenses || [])
    .filter((e: Expense) => filteredVehicleIds.has(e.vehicleId))
    .slice(-5)
    .reverse();

  const showVehiclesKPI = user.role === 'Admin' || user.role === 'Fleet Manager' || user.role === 'Financial Analyst' || user.role === 'Dispatcher';
  const showTripsKPI = user.role === 'Admin' || user.role === 'Dispatcher' || user.role === 'Fleet Manager' || user.role === 'Financial Analyst';
  const showDriversKPI = user.role === 'Admin' || user.role === 'Safety Officer';

  return (
    <div className="db-section">
      <div className="hero-card" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow">Operations Overview ({user.role})</p>
          <h2>Welcome back, {user.name}</h2>
          <p>Monitor your fleet, maintenance logs, compliance, and expenses in real-time.</p>
        </div>
        <div className="hero-badges">
          <span>RBAC Active</span>
          <span>Role: {user.role}</span>
          <span>SQLite Database</span>
        </div>
      </div>

      {/* Dashboard Filters Row */}
      <div className="db-section-header" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div className="db-search-bar" style={{ gap: '1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by Vehicle Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%' }}>
              <option value="All">All Types</option>
              <option value="Van">Van</option>
              <option value="Bus">Bus</option>
              <option value="Truck">Truck</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by Vehicle Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by Region</label>
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} style={{ width: '100%' }}>
              <option value="All">All Regions</option>
              {regions.map((r: string) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="db-kpi-grid">
        {showVehiclesKPI && (
          <>
            <StatCard label="Available Vehicles" value={kpi.availV} sub="ready for dispatch" accent="#16a34a" />
            <StatCard label="In Maintenance" value={kpi.inShopV} sub="vehicles in shop" accent="#d97706" />
            <StatCard label="Retired" value={kpi.retiredV} sub="out of service" accent="#94a3b8" />
          </>
        )}
        {showTripsKPI && (
          <>
            <StatCard label="Active Trips" value={kpi.activeTrips} sub="currently dispatched" accent="#2563eb" />
            <StatCard label="Pending Trips" value={kpi.pendingTrips} sub="awaiting dispatch" accent="#8b5cf6" />
          </>
        )}
        {showDriversKPI && (
          <StatCard label="Drivers On Duty" value={kpi.driversOnDuty} sub="currently on trip" accent="#0891b2" />
        )}
        {showVehiclesKPI && (
          <>
            <StatCard label="Fleet Utilization" value={`${kpi.utilization}%`} sub="active / total vehicles" accent="#059669" />
            <StatCard label="Total Fleet" value={kpi.totalV} sub="registered vehicles" accent="#475569" />
          </>
        )}
      </div>

      <div className="db-two-col" style={{ marginTop: '1.5rem' }}>
        {/* Panel 1: Active Trips (Dispatcher / Admin) */}
        {(user.role === 'Admin' || user.role === 'Dispatcher') && (
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
        )}

        {/* Panel 2: License Expiry Alerts (Safety Officer / Admin) */}
        {(user.role === 'Admin' || user.role === 'Safety Officer') && (
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
        )}

        {/* Panel 3: Open Maintenance Logs (Fleet Manager / Admin) */}
        {(user.role === 'Admin' || user.role === 'Fleet Manager') && (
          <div className="panel">
            <div className="panel-header"><h3>🔧 Open Maintenance Tasks</h3></div>
            {recentMaint.length === 0 ? (
              <p className="db-empty">No open maintenance logs.</p>
            ) : (
              <div className="rows">
                {recentMaint.map((m: Maintenance) => (
                  <div className="card" key={m.id}>
                    <div>
                      <h4>Vehicle #{m.vehicleId} · {m.type}</h4>
                      <p>{m.description}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Cost: {fmtCurrency(m.cost)} · Logged on {m.date}
                      </p>
                    </div>
                    <Pill status="Open" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel 4: Recent Expenses (Financial Analyst / Admin) */}
        {(user.role === 'Admin' || user.role === 'Financial Analyst') && (
          <div className="panel">
            <div className="panel-header"><h3>💰 Recent Expenses</h3></div>
            {recentExpenses.length === 0 ? (
              <p className="db-empty">No expenses logged yet.</p>
            ) : (
              <div className="rows">
                {recentExpenses.map((e: Expense) => (
                  <div className="card" key={e.id}>
                    <div>
                      <h4>Vehicle #{e.vehicleId} · {e.type}</h4>
                      <p>{e.notes || 'No description'}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Amount: {fmtCurrency(e.amount)} · Date: {e.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VehiclesView({ vehicles, reloadData, isAuthorized, showAlert }: any) {
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ registration: '', name: '', model: '', type: 'Van', capacity: '', odometer: '', cost: '', region: 'North' });
  const [formErr, setFormErr] = useState('');

  const filtered = useMemo(() => vehicles.filter((v: Vehicle) => {
    const statusOk = filter === 'All' || v.status === filter;
    const typeOk = typeFilter === 'All' || v.type === typeFilter;
    const searchOk = !search || v.registration.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase());
    return statusOk && typeOk && searchOk;
  }), [vehicles, filter, typeFilter, search]);

  const addVehicle = async () => {
    if (!isAuthorized('manage_vehicles')) {
      showAlert('Access Denied: Only Fleet Managers or Admins can register vehicles.');
      return;
    }
    if (!form.registration || !form.name || !form.capacity) { setFormErr('Registration, Name, and Capacity are required.'); return; }
    try {
      const res = await axios.post(`${API_URL}/vehicles`, {
        ...form,
        capacity: +form.capacity,
        odometer: +form.odometer || 0,
        cost: +form.cost || 0
      });
      if (res.data.success) {
        setForm({ registration: '', name: '', model: '', type: 'Van', capacity: '', odometer: '', cost: '', region: 'North' });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to save vehicle.');
    }
  };

  const retireVehicle = async (id: number) => {
    if (!isAuthorized('manage_vehicles')) {
      showAlert('Access Denied: Only Fleet Managers or Admins can retire vehicles.');
      return;
    }
    try {
      await axios.put(`${API_URL}/vehicles/${id}/status`, { status: 'Retired' });
      reloadData();
    } catch (err: any) {
      showAlert('Failed to retire vehicle.');
    }
  };

  const sendToShop = async (id: number) => {
    if (!isAuthorized('manage_maintenance')) {
      showAlert('Access Denied: Only Fleet Managers or Admins can send vehicles to maintenance.');
      return;
    }
    try {
      await axios.post(`${API_URL}/maintenance`, { vehicleId: id, type: 'Unscheduled', description: 'Manual maintenance entry', cost: 0 });
      reloadData();
    } catch (err: any) {
      showAlert('Failed to send vehicle to maintenance.');
    }
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
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Vehicle</button>
      </div>

      {showForm && (
        <div className="panel db-form-panel">
          <h4 className="db-form-title">Register New Vehicle</h4>
          {formErr && <div className="db-form-err">{formErr}</div>}
          <div className="db-form-grid">
            <div className="db-field"><label>Registration *</label><input value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} /></div>
            <div className="db-field"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="db-field"><label>Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
            <div className="db-field"><label>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}><option>Van</option><option>Bus</option><option>Truck</option></select></div>
            <div className="db-field"><label>Max Capacity (kg) *</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
            <div className="db-field"><label>Region *</label><select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}><option>North</option><option>South</option><option>East</option><option>West</option></select></div>
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
            <thead><tr><th>Registration</th><th>Vehicle</th><th>Type</th><th>Region</th><th>Capacity</th><th>Odometer</th><th>Acq. Cost</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((v: Vehicle) => (
                <tr key={v.id}>
                  <td><strong>{v.registration}</strong></td>
                  <td>{v.name}<br /><small style={{ color: '#94a3b8' }}>{v.model}</small></td>
                  <td>{v.type}</td>
                  <td>{v.region || 'North'}</td>
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

function DriversView({ drivers, reloadData, isAuthorized, showAlert }: any) {
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

  const addDriver = async () => {
    if (!isAuthorized('manage_drivers')) {
      showAlert('Access Denied: Only Safety Officers or Admins can register drivers.');
      return;
    }
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) { setFormErr('Name, License Number, and Expiry are required.'); return; }
    try {
      const res = await axios.post(`${API_URL}/drivers`, {
        ...form,
        safetyScore: +form.safetyScore || 100
      });
      if (res.data.success) {
        setForm({ name: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '', contact: '', safetyScore: '' });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to save driver.');
    }
  };

  const suspendDriver = async (id: number) => {
    if (!isAuthorized('manage_drivers')) {
      showAlert('Access Denied: Only Safety Officers or Admins can suspend drivers.');
      return;
    }
    try {
      await axios.put(`${API_URL}/drivers/${id}/status`, { status: 'Suspended' });
      reloadData();
    } catch (err: any) {
      showAlert('Failed to suspend driver.');
    }
  };

  const activateDriver = async (id: number) => {
    if (!isAuthorized('manage_drivers')) {
      showAlert('Access Denied: Only Safety Officers or Admins can activate drivers.');
      return;
    }
    try {
      await axios.put(`${API_URL}/drivers/${id}/status`, { status: 'Available' });
      reloadData();
    } catch (err: any) {
      showAlert('Failed to activate driver.');
    }
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
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ Add Driver</button>
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

function TripsView({ trips, reloadData, vehicles, drivers, dispatchTrip, completeTrip, cancelTrip, isAuthorized, showAlert }: any) {
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
  const [formErr, setFormErr] = useState('');
  const [completeTripId, setCompleteTripId] = useState<number | null>(null);
  const [fuelUsed, setFuelUsed] = useState('');

  const filtered = useMemo(() => trips.filter((t: Trip) => filter === 'All' || t.status === filter), [trips, filter]);

  const availVehicles = vehicles.filter((v: Vehicle) => v.status === 'Available');
  const availDrivers = drivers.filter((d: Driver) => d.status === 'Available' && !isExpired(d.licenseExpiry));


  const createTrip = async () => {
    if (!isAuthorized('manage_trips')) {
      showAlert('Access Denied: Only Dispatchers or Admins can create trips.');
      return;
    }
    if (!form.source || !form.destination || !form.vehicleId || !form.driverId || !form.cargoWeight) { setFormErr('All fields are required.'); return; }
    const vehicle = vehicles.find((v: Vehicle) => v.id === +form.vehicleId);
    if (vehicle && +form.cargoWeight > vehicle.capacity) { setFormErr(`Cargo (${form.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`); return; }

    try {
      const res = await axios.post(`${API_URL}/trips`, {
        ...form,
        vehicleId: +form.vehicleId,
        driverId: +form.driverId,
        cargoWeight: +form.cargoWeight,
        distance: +form.distance || 0
      });
      if (res.data.success) {
        setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to create trip.');
    }
  };

  const handleCompleteSubmit = () => {
    if (completeTripId) {
      completeTrip(completeTripId, +fuelUsed || 0);
      setCompleteTripId(null);
      setFuelUsed('');
    }
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
        <button className="primary" onClick={() => setShowForm(!showForm)}>+ New Trip</button>
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

      {completeTripId !== null && (
        <div className="panel db-form-panel" style={{ border: '1.5px solid #16a34a', background: '#f0fdf4' }}>
          <h4 className="db-form-title">Complete Trip #{completeTripId}</h4>
          <div className="db-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="db-field">
              <label>Fuel Consumed (Liters)</label>
              <input type="number" value={fuelUsed} onChange={e => setFuelUsed(e.target.value)} placeholder="e.g. 18" />
            </div>
          </div>
          <div className="db-form-footer" style={{ marginTop: '1rem' }}>
            <button className="primary" onClick={handleCompleteSubmit}>Submit & Free Fleet</button>
            <button className="ghost" onClick={() => setCompleteTripId(null)}>Cancel</button>
          </div>
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
                      {t.status === 'Dispatched' && <><button className="db-action-btn" onClick={() => setCompleteTripId(t.id)}>Complete</button><button className="db-action-btn danger" onClick={() => cancelTrip(t.id)}>Cancel</button></>}
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

function MaintenanceView({ maintenances, reloadData, vehicles, closeMaintenance, isAuthorized, showAlert }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: '', description: '', cost: '', date: today });
  const [formErr, setFormErr] = useState('');

  const addMaintenance = async () => {
    if (!isAuthorized('manage_maintenance')) {
      showAlert('Access Denied: Only Fleet Managers or Admins can manage maintenance.');
      return;
    }
    if (!form.vehicleId || !form.type) { setFormErr('Vehicle and Type are required.'); return; }
    try {
      const res = await axios.post(`${API_URL}/maintenance`, {
        ...form,
        vehicleId: +form.vehicleId,
        cost: +form.cost || 0
      });
      if (res.data.success) {
        setForm({ vehicleId: '', type: '', description: '', cost: '', date: today });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to save maintenance.');
    }
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

function FuelView({ fuelLogs, reloadData, vehicles, isAuthorized, showAlert }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: today, odometer: '' });
  const [formErr, setFormErr] = useState('');

  const addFuelLog = async () => {
    if (!isAuthorized('manage_fuel')) {
      showAlert('Access Denied: Only Fleet Managers, Dispatchers, or Admins can log fuel.');
      return;
    }
    if (!form.vehicleId || !form.liters || !form.cost) { setFormErr('Vehicle, Liters, and Cost are required.'); return; }
    try {
      const res = await axios.post(`${API_URL}/fuel`, {
        ...form,
        vehicleId: +form.vehicleId,
        liters: +form.liters,
        cost: +form.cost,
        odometer: +form.odometer || 0
      });
      if (res.data.success) {
        setForm({ vehicleId: '', liters: '', cost: '', date: today, odometer: '' });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to save fuel log.');
    }
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
                    <td>{f.liters > 0 ? (f.cost / f.liters).toFixed(2) : '-'}</td>
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

function ExpensesView({ expenses, reloadData, vehicles, isAuthorized, showAlert }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: 'Toll', amount: '', date: today, notes: '' });
  const [formErr, setFormErr] = useState('');

  const addExpense = async () => {
    if (!isAuthorized('manage_expenses')) {
      showAlert('Access Denied: Only Financial Analysts, Fleet Managers, or Admins can log expenses.');
      return;
    }
    if (!form.vehicleId || !form.amount) { setFormErr('Vehicle and Amount are required.'); return; }
    try {
      const res = await axios.post(`${API_URL}/expenses`, {
        ...form,
        vehicleId: +form.vehicleId,
        amount: +form.amount
      });
      if (res.data.success) {
        setForm({ vehicleId: '', type: 'Toll', amount: '', date: today, notes: '' });
        setFormErr('');
        setShowForm(false);
        reloadData();
      }
    } catch (err: any) {
      setFormErr(err.response?.data?.errors?.[0] || 'Failed to save expense.');
    }
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

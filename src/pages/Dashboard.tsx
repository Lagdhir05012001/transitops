import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

type Vehicle = {
  id: number;
  registration: string;
  name: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  cost: number;
  status: VehicleStatus;
};

type Driver = {
  id: number;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  safetyScore: number;
  status: DriverStatus;
};

type Trip = {
  id: number;
  source: string;
  destination: string;
  vehicleId: number;
  driverId: number;
  cargoWeight: number;
  distance: number;
  status: TripStatus;
};

type MaintenanceRecord = {
  id: number;
  vehicleId: number;
  type: string;
  description: string;
  cost: number;
  date: string;
  status: 'Open' | 'Closed';
};

const initialVehicles: Vehicle[] = [
  { id: 1, registration: 'Van-05', name: 'City Van', model: 'Sprinter', type: 'Van', capacity: 500, odometer: 12000, cost: 45000, status: 'Available' },
  { id: 2, registration: 'Bus-12', name: 'Metro Bus', model: 'Aero', type: 'Bus', capacity: 1200, odometer: 35000, cost: 98000, status: 'Available' },
  { id: 3, registration: 'Truck-07', name: 'Cargo Truck', model: 'Pro 700', type: 'Truck', capacity: 1500, odometer: 28000, cost: 112000, status: 'In Shop' },
];

const initialDrivers: Driver[] = [
  { id: 1, name: 'Alex Carter', licenseNumber: 'DL-1001', licenseCategory: 'B', licenseExpiry: '2027-08-10', contact: '+1 555 0101', safetyScore: 92, status: 'Available' },
  { id: 2, name: 'Mina Patel', licenseNumber: 'DL-2002', licenseCategory: 'C', licenseExpiry: '2026-10-01', contact: '+1 555 0102', safetyScore: 88, status: 'Available' },
];

const initialTrips: Trip[] = [
  { id: 1, source: 'Depot A', destination: 'North Hub', vehicleId: 1, driverId: 1, cargoWeight: 450, distance: 140, status: 'Draft' },
];

const initialMaintenances: MaintenanceRecord[] = [
  { id: 1, vehicleId: 3, type: 'Oil Change', description: 'Routine service', cost: 180, date: '2026-07-10', status: 'Open' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('transitops_user');
  const user = userRaw ? JSON.parse(userRaw) : { name: 'Admin User', role: 'Admin' };

  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [trips, setTrips] = useState(initialTrips);
  const [maintenances, setMaintenances] = useState(initialMaintenances);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  const inShopVehicles = vehicles.filter((v) => v.status === 'In Shop').length;
  const onDutyDrivers = drivers.filter((d) => d.status === 'Available' || d.status === 'On Trip').length;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const regionMatch = selectedRegion === 'All' || v.type === selectedRegion;
      const typeMatch = selectedType === 'All' || v.type === selectedType;
      return regionMatch && typeMatch;
    });
  }, [vehicles, selectedRegion, selectedType]);

  const dispatchTrip = (tripId: number) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((cur) => cur.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched' } : t)));
    setVehicles((cur) => cur.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v)));
    setDrivers((cur) => cur.map((d) => (d.id === trip.driverId ? { ...d, status: 'On Trip' } : d)));
  };

  const completeTrip = (tripId: number) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((cur) => cur.map((t) => (t.id === tripId ? { ...t, status: 'Completed' } : t)));
    setVehicles((cur) => cur.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v)));
    setDrivers((cur) => cur.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)));
  };

  const openMaintenance = () => {
    setVehicles((cur) => cur.map((v) => (v.id === 3 ? { ...v, status: 'In Shop' } : v)));
    setMaintenances((cur) => [
      ...cur,
      { id: Date.now(), vehicleId: 3, type: 'Oil Change', description: 'Routine service', cost: 180, date: new Date().toISOString().slice(0, 10), status: 'Open' },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('transitops_user');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">TransitOps</p>
          <h1>Fleet command center</h1>
        </div>
        <div className="topbar-actions">
          <div className="topbar-user">
            <span className="topbar-user-avatar">{user.name.charAt(0)}</span>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user.name}</span>
              <span className="topbar-user-role">{user.role}</span>
            </div>
          </div>
          <button className="ghost" onClick={() => navigate('/')}>Home</button>
          <button className="ghost" onClick={handleLogout}>Logout</button>
          <button className="primary" onClick={openMaintenance}>+ Maintenance</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Operations overview</p>
            <h2>Keep dispatch, maintenance, and compliance moving.</h2>
            <p>Monitor vehicles, drivers, active trips, and vehicle health from one responsive workspace.</p>
          </div>
          <div className="hero-badges">
            <span>RBAC ready</span>
            <span>Audit-friendly</span>
            <span>Enterprise scale</span>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <h3>Available vehicles</h3>
            <strong>{availableVehicles}</strong>
            <span>ready for dispatch</span>
          </article>
          <article className="stat-card">
            <h3>In shop</h3>
            <strong>{inShopVehicles}</strong>
            <span>maintenance window</span>
          </article>
          <article className="stat-card">
            <h3>Active trips</h3>
            <strong>{activeTrips}</strong>
            <span>in transit</span>
          </article>
          <article className="stat-card">
            <h3>Drivers on duty</h3>
            <strong>{onDutyDrivers}</strong>
            <span>available or assigned</span>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Fleet overview</h3>
            <div className="filters">
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                <option value="All">All regions</option>
                <option value="Van">North</option>
                <option value="Bus">Central</option>
                <option value="Truck">South</option>
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="All">All types</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Registration</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.registration}</strong></td>
                    <td>{v.name} · {v.model}</td>
                    <td><span className={`pill ${v.status.toLowerCase().replace(/\s+/g, '-')}`}>{v.status}</span></td>
                    <td>{v.capacity.toLocaleString()} kg</td>
                    <td>{v.odometer.toLocaleString()} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Dispatch board</h3>
            <button className="primary" onClick={openMaintenance}>+ Create maintenance</button>
          </div>
          <div className="rows">
            {trips.map((trip) => (
              <article className="card" key={trip.id}>
                <div>
                  <h4>{trip.source} → {trip.destination}</h4>
                  <p>Vehicle {trip.vehicleId} · Driver {trip.driverId} · {trip.cargoWeight} kg · {trip.distance} km</p>
                </div>
                <div className="card-actions">
                  <span className={`pill ${trip.status.toLowerCase()}`}>{trip.status}</span>
                  {trip.status === 'Draft' && (
                    <button className="primary" onClick={() => dispatchTrip(trip.id)}>Dispatch</button>
                  )}
                  {trip.status === 'Dispatched' && (
                    <button className="ghost" onClick={() => completeTrip(trip.id)}>Complete</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Driver compliance</h3>
          </div>
          <div className="rows">
            {drivers.map((driver) => (
              <article className="card" key={driver.id}>
                <div>
                  <h4>{driver.name}</h4>
                  <p>{driver.licenseNumber} · Cat {driver.licenseCategory} · Expiry {driver.licenseExpiry}</p>
                </div>
                <div className="card-actions">
                  <span className={`pill ${driver.status.toLowerCase().replace(/\s+/g, '-')}`}>{driver.status}</span>
                  <div className="safety-score">
                    <span className="safety-label">Safety</span>
                    <strong className="safety-value">{driver.safetyScore}%</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Maintenance log</h3>
          </div>
          <div className="rows">
            {maintenances.map((record) => (
              <article className="card" key={record.id}>
                <div>
                  <h4>{record.type}</h4>
                  <p>{record.description} · Vehicle #{record.vehicleId} · {record.date}</p>
                </div>
                <div className="card-actions">
                  <span className={`pill ${record.status.toLowerCase()}`}>{record.status}</span>
                  <span className="cost-badge">${record.cost}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

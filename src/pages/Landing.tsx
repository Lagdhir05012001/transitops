import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  DollarSign,
  BarChart3,
  Lock,
  Zap,
  Code,
  Gauge,
  Workflow,
  Server,
  Layers,
  Database,
  Key
} from 'lucide-react';

const GITHUB_URL = 'https://github.com/Lagdhir05012001/transitops';

const features = [
  {
    icon: Truck,
    title: 'Fleet Management',
    desc: 'Centralized registry for all vehicles — track registration, model, capacity, odometer, acquisition cost, and real-time status across your entire fleet.',
    tags: ['Available', 'On Trip', 'In Shop', 'Retired'],
  },
  {
    icon: Users,
    title: 'Driver Management',
    desc: 'Maintain complete driver profiles with license category, expiry dates, safety scores, and compliance status. Auto-block expired or suspended drivers.',
    tags: ['License Expiry', 'Safety Score', 'RBAC'],
  },
  {
    icon: Route,
    title: 'Trip Dispatch',
    desc: 'Create and dispatch trips with intelligent validations. Cargo weight checks, driver eligibility, and vehicle availability enforced automatically.',
    tags: ['Draft → Dispatched', 'Auto Status', 'Validation'],
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    desc: 'Log preventive and corrective maintenance records. Vehicles automatically move to "In Shop" status during maintenance and back on completion.',
    tags: ['Oil Change', 'Brake Repair', 'Engine Service'],
  },
  {
    icon: Fuel,
    title: 'Fuel Management',
    desc: 'Maintain detailed fuel logs per vehicle. Track quantity, cost, date, and odometer readings to monitor fuel efficiency across the fleet.',
    tags: ['Fuel Logs', 'Efficiency', 'Cost Tracking'],
  },
  {
    icon: DollarSign,
    title: 'Expense Tracking',
    desc: 'Record and categorize operational expenses — fuel, tolls, repairs, insurance, and miscellaneous. Auto-calculate total operational cost.',
    tags: ['Fuel', 'Toll', 'Insurance', 'Repairs'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Generate fleet utilization, fuel efficiency, vehicle ROI, and operational cost reports. Export data to CSV for external analysis.',
    tags: ['Fleet Utilization', 'ROI', 'CSV Export'],
  },
  {
    icon: Lock,
    title: 'Role-Based Access',
    desc: 'JWT authentication with 5 distinct roles — Admin, Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst. Protected routes enforced.',
    tags: ['JWT', 'RBAC', '5 Roles'],
  },
];

const businessRules = [
  'Retired vehicles cannot be dispatched',
  'Vehicles in maintenance cannot be assigned to trips',
  'Cargo weight must not exceed vehicle max capacity',
  'Expired driver license blocks dispatch',
  'Suspended drivers cannot be assigned',
  'Driver already on trip cannot be reassigned',
  'Vehicle already on trip cannot be reassigned',
  'Completing a trip auto-frees vehicle & driver',
];

const techStack = [
  { label: 'React 18', icon: Zap },
  { label: 'TypeScript', icon: Code },
  { label: 'Vite', icon: Gauge },
  { label: 'React Router v7', icon: Workflow },
  { label: 'Node.js + Express', icon: Server },
  { label: 'Prisma ORM', icon: Layers },
  { label: 'PostgreSQL', icon: Database },
  { label: 'JWT Auth', icon: Key },
];


export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── NAV ─────────────────────────────────── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-brand">
            <Truck className="land-logo-icon" size={24} style={{ color: 'var(--primary)' }} />
            <span className="land-brand-name">TransitOps</span>
          </div>
          <div className="land-nav-links">
            <a href="#features">Features</a>
            <a href="#rules">Business Rules</a>
            <a href="#stack">Tech Stack</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="land-github-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <button className="land-cta-nav" onClick={() => navigate('/login')}>
              Login to Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────── */}
      <section className="land-hero">
        <div className="land-hero-inner">
          <div className="land-badge">🏆 Open Source · Hackathon Project</div>
          <h1 className="land-hero-title">
            Smart Transport<br />
            <span className="land-hero-accent">Operations Platform</span>
          </h1>
          <p className="land-hero-subtitle">
            TransitOps replaces spreadsheets and manual logbooks with a centralized, 
            automated platform. Manage your entire fleet lifecycle — from dispatch to 
            maintenance, driver compliance to financial analytics.
          </p>
          <div className="land-hero-actions">
            <button className="land-btn-primary" onClick={() => navigate('/login')}>
              🚀 Launch Dashboard
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="land-btn-ghost"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
          <div className="land-hero-stats">
            <div className="land-stat-pill"><Truck size={16} style={{ marginRight: '6px' }} /> Fleet Management</div>
            <div className="land-stat-pill"><Users size={16} style={{ marginRight: '6px' }} /> Driver Compliance</div>
            <div className="land-stat-pill"><BarChart3 size={16} style={{ marginRight: '6px' }} /> Real-time Analytics</div>
            <div className="land-stat-pill"><Lock size={16} style={{ marginRight: '6px' }} /> RBAC + JWT</div>
          </div>
        </div>
        <div className="land-hero-visual">
          <div className="land-mockup">
            <div className="land-mockup-bar">
              <span /><span /><span />
            </div>
            <div className="land-mockup-body">
              <div className="land-mockup-kpi-row">
                <div className="land-mockup-kpi" style={{ borderTop: '3px solid #2563eb' }}>
                  <div className="lm-label">Active Vehicles</div>
                  <div className="lm-value">12</div>
                </div>
                <div className="land-mockup-kpi" style={{ borderTop: '3px solid #16a34a' }}>
                  <div className="lm-label">Active Trips</div>
                  <div className="lm-value">5</div>
                </div>
                <div className="land-mockup-kpi" style={{ borderTop: '3px solid #d97706' }}>
                  <div className="lm-label">In Maintenance</div>
                  <div className="lm-value">2</div>
                </div>
              </div>
              <div className="land-mockup-table">
                <div className="lm-thead">
                  <span>Registration</span><span>Status</span><span>Odometer</span>
                </div>
                {[
                  ['Van-05', 'Available', '12,000 km'],
                  ['Bus-12', 'On Trip', '35,000 km'],
                  ['Truck-07', 'In Shop', '28,000 km'],
                ].map(([reg, status, odo]) => (
                  <div className="lm-row" key={reg}>
                    <span>{reg}</span>
                    <span className={`lm-pill ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                    <span>{odo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────── */}
      <section className="land-section" id="features">
        <div className="land-container">
          <div className="land-section-header">
            <span className="land-section-tag">Platform Features</span>
            <h2>Everything you need to run a modern fleet</h2>
            <p>End-to-end transport operations management in one place — no more spreadsheets or scattered tools.</p>
          </div>
          <div className="land-features-grid">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div className="land-feature-card" key={f.title}>
                  <div className="land-feature-icon"><Icon size={24} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="land-feature-tags">
                    {f.tags.map((t) => <span key={t}>{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BUSINESS RULES ──────────────────────── */}
      <section className="land-rules-section" id="rules">
        <div className="land-container">
          <div className="land-section-header" style={{ color: '#fff' }}>
            <span className="land-section-tag land-tag-light">Business Rules</span>
            <h2 style={{ color: '#fff' }}>Enforced automatically — no manual checks needed</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              TransitOps validates every action against strict business rules. Dispatch rejections, 
              compliance failures, and capacity violations are caught before they happen.
            </p>
          </div>
          <div className="land-rules-grid">
            {businessRules.map((rule, i) => (
              <div className="land-rule-item" key={i}>
                <span className="land-rule-check">✓</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────── */}
      <section className="land-section" id="stack">
        <div className="land-container">
          <div className="land-section-header">
            <span className="land-section-tag">Tech Stack</span>
            <h2>Built on proven, modern technologies</h2>
            <p>Full-stack TypeScript from UI to database — type-safe, maintainable, and scalable.</p>
          </div>
          <div className="land-stack-grid">
            {techStack.map((t) => {
              const Icon = t.icon;
              return (
                <div className="land-stack-card" key={t.label}>
                  <span className="land-stack-icon"><Icon size={20} /></span>
                  <span className="land-stack-label">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SETUP STEPS ─────────────────────────── */}
      <section className="land-section land-setup-section" id="setup">
        <div className="land-container">
          <div className="land-section-header">
            <span className="land-section-tag">Quick Start</span>
            <h2>Get running in 4 steps</h2>
            <p>Clone, install dependencies, start the backend, and run the client.</p>
          </div>
          <div className="land-steps">
            <div className="land-step">
              <div className="land-step-num">1</div>
              <div className="land-step-content">
                <h4>Clone the repository</h4>
                <code>git clone https://github.com/Lagdhir05012001/transitops.git<br />cd transitops</code>
              </div>
            </div>
            <div className="land-step">
              <div className="land-step-num">2</div>
              <div className="land-step-content">
                <h4>Install dependencies</h4>
                <code>npm install</code>
              </div>
            </div>
            <div className="land-step">
              <div className="land-step-num">3</div>
              <div className="land-step-content">
                <h4>Start the backend API</h4>
                <code>npm run backend</code>
                <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Launches SQLite Express API server on <strong>http://localhost:4000</strong>
                </p>
              </div>
            </div>
            <div className="land-step">
              <div className="land-step-num">4</div>
              <div className="land-step-content">
                <h4>Start the frontend client</h4>
                <code>npm run dev</code>
                <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Opens Vite dev server at <strong>http://localhost:3000</strong> · Login with <strong>admin@transitops.com / password</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE CTA ─────────────────────── */}
      <section className="land-oss-cta">
        <div className="land-container">
          <div className="land-oss-inner">
            <div>
              <h2>Open Source & Free</h2>
              <p>TransitOps is fully open source under MIT license. Star the repo, raise issues, submit PRs — contributions are welcome!</p>
            </div>
            <div className="land-oss-actions">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="land-btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                ⭐ Star on GitHub
              </a>
              <button className="land-btn-ghost-dark" onClick={() => navigate('/login')}>
                Try the Dashboard →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="land-footer">
        <div className="land-container">
          <div className="land-footer-inner">
            <div className="land-brand">
              <Truck className="land-logo-icon" size={24} style={{ color: 'var(--primary)' }} />
              <span className="land-brand-name">TransitOps</span>
            </div>
            <p className="land-footer-tagline">Smart Transport Operations Platform · Open Source · MIT License</p>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="land-footer-github">
              github.com/Lagdhir05012001/transitops
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

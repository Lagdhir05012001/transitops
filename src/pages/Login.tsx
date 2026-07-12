import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck } from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

const DEMO_USERS = [
  { email: 'admin@transitops.com', password: 'password', role: 'Admin', name: 'Admin User' },
  { email: 'fleet@transitops.com', password: 'password', role: 'Fleet Manager', name: 'Fleet Manager' },
  { email: 'dispatch@transitops.com', password: 'password', role: 'Dispatcher', name: 'Dispatcher' },
  { email: 'safety@transitops.com', password: 'password', role: 'Safety Officer', name: 'Safety Officer' },
  { email: 'finance@transitops.com', password: 'password', role: 'Financial Analyst', name: 'Financial Analyst' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        // Map backend roles string to role property expected by frontend
        const mappedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.roles // Maps 'Admin', 'Fleet Manager', etc.
        };
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('transitops_user', JSON.stringify(mappedUser));
        navigate('/dashboard');
      } else {
        setError(response.data.errors?.[0] || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'Unable to connect to login server.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u: (typeof DEMO_USERS)[0]) => {
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  return (
    <div className="login-shell">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-brand">
            <Truck className="login-logo-icon" size={24} style={{ color: 'var(--primary)' }} />
            <span className="login-brand-name">TransitOps</span>
          </div>
          <h2 className="login-tagline">
            Fleet operations,<br />
            <span>simplified.</span>
          </h2>
          <p className="login-desc">
            The enterprise-grade transport operations platform that digitizes your entire fleet workflow — dispatch, maintenance, compliance, and analytics in one place.
          </p>
          <div className="login-features-list">
            {[
              '✓ Real-time fleet dashboard',
              '✓ Intelligent trip dispatch',
              '✓ Driver compliance tracking',
              '✓ Maintenance management',
              '✓ Role-based access control',
            ].map((f) => (
              <div key={f} className="login-feature-item">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h1>Welcome back</h1>
            <p>Sign in to your TransitOps account</p>
          </div>

          {error && <div className="login-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                'Sign In to Dashboard →'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo">
            <p className="login-demo-label">Quick access — demo accounts</p>
            <div className="login-demo-grid">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  className="login-demo-btn"
                  type="button"
                  onClick={() => fillDemo(u)}
                >
                  <span className="login-demo-role">{u.role}</span>
                  <span className="login-demo-email">{u.email}</span>
                </button>
              ))}
            </div>
            <p className="login-demo-note">All demo accounts use password: <strong>password</strong></p>
          </div>

          <div className="login-back">
            <button
              type="button"
              className="login-back-link"
              onClick={() => navigate('/')}
            >
              ← Back to landing page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

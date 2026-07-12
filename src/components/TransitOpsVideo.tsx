import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, spring, interpolate, Audio } from 'remotion';

export function TransitOpsVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Total duration: 480 frames (16 seconds at 30 fps)
  // Slide 1: 0 to 120 (4s) - Intro & High-Level KPIs
  // Slide 2: 120 to 240 (4s) - Role-Based Dashboard Personalization
  // Slide 3: 240 to 360 (4s) - Automated Verification Logic
  // Slide 4: 360 to 480 (4s) - Meet the Creators (LinkedIn Profile Cards with Photos)
  const slideDuration = 120;
  const currentSlide = Math.floor(frame / slideDuration);
  const slideFrame = frame % slideDuration;

  // Spring animation helper
  const spr = (from: number, to: number, startFrame: number = 0) => {
    return spring({
      frame: slideFrame - startFrame,
      fps,
      config: { damping: 12, mass: 0.5 },
      from,
      to,
    });
  };

  // Base Slide Styles
  const slideStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  const glowBackground: React.CSSProperties = {
    position: 'absolute',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, rgba(0,0,0,0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
    pointerEvents: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0, 119, 181, 0.25)',
    border: 'none',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'transform 0.15s ease',
  };

  const renderSlide = () => {
    if (currentSlide === 0) {
      // SLIDE 1: INTRO & HIGH LEVEL PREVIEW
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleScale = spr(0.8, 1, 0);
      const subtitleOpacity = interpolate(slideFrame, [15, 30], [0, 1]);
      const subtitleY = spr(30, 0, 15);
      const statsOpacity = interpolate(slideFrame, [35, 50], [0, 1]);
      const statsScale = spr(0.9, 1, 35);

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ fontSize: '72px' }}>🚛</div>
              <h1 style={{
                fontSize: '68px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: titleOpacity,
                transform: `scale(${titleScale})`,
                margin: 0,
                letterSpacing: '-2px',
              }}>
                TransitOps
              </h1>
            </div>
            
            <p style={{
              fontSize: '26px',
              color: '#475569',
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              margin: '0 0 45px 0',
              fontWeight: 500,
            }}>
              Smart Transport Operations & Fleet Command Center
            </p>

            {/* KPI Mockup Row */}
            <div style={{
              display: 'flex',
              gap: '20px',
              opacity: statsOpacity,
              transform: `scale(${statsScale})`,
              justifyContent: 'center',
            }}>
              {[
                { label: 'Available Vehicles', val: '12', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Active Trips', val: '5', color: '#2563eb', bg: '#eff6ff' },
                { label: 'In Maintenance', val: '2', color: '#d97706', bg: '#fffbeb' },
              ].map((k) => (
                <div key={k.label} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 28px',
                  width: '180px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>{k.label}</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: k.color }}>{k.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 1) {
      // SLIDE 2: ROLE-BASED PERSONALIZATION
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const gridOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const gridScale = spr(0.92, 1, 20);

      const roles = [
        { name: 'Fleet Manager', icon: '🔧', color: '#d97706', desc: 'Monitors vehicle status registry, logs repairs, and manages active maintenance.' },
        { name: 'Dispatcher', icon: '🗺️', color: '#2563eb', desc: 'Creates new transport trips and dispatches them adhering to load rules.' },
        { name: 'Safety Officer', icon: '🛡️', color: '#0891b2', desc: 'Reviews driver compliance, driving license dates, and tracks safety scores.' },
        { name: 'Financial Analyst', icon: '📈', color: '#059669', desc: 'Examines operational fuel logs, toll expenses, and calculates vehicle ROI.' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '950px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#0f172a',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 10px 0',
            }}>
              Role-Based Dashboard Control
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              opacity: titleOpacity,
              margin: '0 0 35px 0',
              fontWeight: 500,
            }}>
              Separate views restrict raw data and operations to authorized personnel.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              opacity: gridOpacity,
              transform: `scale(${gridScale})`,
            }}>
              {roles.map((r) => (
                <div key={r.name} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  gap: '15px',
                  textAlign: 'left',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
                }}>
                  <div style={{
                    fontSize: '28px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    flexShrink: 0,
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: r.color, margin: '0 0 6px 0' }}>
                      {r.name} View
                    </h3>
                    <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 2) {
      // SLIDE 3: AUTOMATED BUSINESS LOGIC
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const cardsOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const cardsScale = spr(0.9, 1, 20);

      const rules = [
        { label: 'Max Cargo validation', desc: 'Validates cargo payload weight against registered vehicle capability before dispatching.' },
        { label: 'License Verification', desc: 'Driver cannot be assigned to trips if their driving license category is wrong or has expired.' },
        { label: 'Status Flow Synchrony', desc: 'Dispatching or finishing trips automatically updates vehicle & driver availability states.' },
        { label: 'Exclusivity locks', desc: 'Enforces that a vehicle or driver cannot be assigned to multiple dispatched trips concurrently.' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '920px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#0f172a',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 10px 0',
            }}>
              Automated Business Rules
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              opacity: titleOpacity,
              margin: '0 0 40px 0',
              fontWeight: 500,
            }}>
              Strict validation ensures fleet operations conform to policies.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              opacity: cardsOpacity,
              transform: `scale(${cardsScale})`,
            }}>
              {rules.map((r) => (
                <div key={r.label} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  textAlign: 'left',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {r.label}
                    </h3>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide >= 3) {
      // SLIDE 4: CREATORS WITH REAL PHOTOS
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const cardsOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const cardsScale = spr(0.9, 1, 20);

      const creators = [
        { name: 'Krunal Rana', role: 'Full Stack Engineer', img: '/images/krunal.png', url: 'https://www.linkedin.com/in/krunal-rana/' },
        { name: 'Lagdhirsinh Vaghela', role: 'Solutions Architect', img: '/images/lagdhir.png', url: 'https://www.linkedin.com/in/lagdhirsinh-vaghela-8512001b5/' },
        { name: 'Dipen Patel', role: 'Security Analyst', img: '/images/dipen.png', url: 'https://www.linkedin.com/in/dipen-patel-69520026a/' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '900px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#0f172a',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 6px 0',
            }}>
              Meet the Developers
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              opacity: titleOpacity,
              margin: '0 0 35px 0',
              fontWeight: 500,
            }}>
              Connect with our development team on LinkedIn
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              opacity: cardsOpacity,
              transform: `scale(${cardsScale})`,
            }}>
              {creators.map((c) => (
                <div key={c.name} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  width: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                }}>
                  {/* Photo Container */}
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #2563eb',
                    marginBottom: '16px',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
                    background: '#f1f5f9',
                  }}>
                    <img 
                      src={c.img} 
                      alt={c.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }} 
                    />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '14px' }}>
                    {c.role}
                  </span>
                  
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    LinkedIn Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <AbsoluteFill>
      <Audio 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        volume={0.12} 
      />
      {renderSlide()}
    </AbsoluteFill>
  );
}

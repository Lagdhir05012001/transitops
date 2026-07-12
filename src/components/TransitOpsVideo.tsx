import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, spring, interpolate } from 'remotion';

export function TransitOpsVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Current Slide Calculation
  // Total duration: 480 frames (16 seconds at 30 fps)
  // Slide 1: 0 to 120 (4s) - Intro
  // Slide 2: 120 to 240 (4s) - RBAC Features
  // Slide 3: 240 to 360 (4s) - Auto Rules
  // Slide 4: 360 to 480 (4s) - Creators / LinkedIn
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

  // Styles
  const slideStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
    color: '#f8fafc',
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
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
    pointerEvents: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 119, 181, 0.4)',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.2s',
  };

  const renderSlide = () => {
    if (currentSlide === 0) {
      // SLIDE 1: INTRO
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleScale = spr(0.8, 1, 0);
      const subtitleOpacity = interpolate(slideFrame, [15, 30], [0, 1]);
      const subtitleY = spr(30, 0, 15);
      const iconScale = spr(0, 1, 30);

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, padding: '0 40px' }}>
            <div style={{ 
              fontSize: '110px', 
              transform: `scale(${iconScale})`, 
              marginBottom: '20px',
              display: 'inline-block'
            }}>
              🚛
            </div>
            <h1 style={{
              fontSize: '64px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              margin: '0 0 15px 0',
              letterSpacing: '-1.5px',
            }}>
              TransitOps
            </h1>
            <p style={{
              fontSize: '28px',
              color: '#94a3b8',
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              margin: 0,
              fontWeight: 400,
            }}>
              Smart Transport Operations Platform
            </p>
          </div>
        </div>
      );
    }

    if (currentSlide === 1) {
      // SLIDE 2: RBAC
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const listOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const cardScale = spr(0.9, 1, 20);

      const roles = [
        { name: 'Admin', desc: 'Full configuration & system oversight' },
        { name: 'Fleet Manager', desc: 'Vehicles lifecycle & maintenance logs' },
        { name: 'Dispatcher', desc: 'Trip assignment & active monitoring' },
        { name: 'Safety Officer', desc: 'Driver validation & compliance checking' },
        { name: 'Financial Analyst', desc: 'Fuel logs, operational costs & ROI reviews' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '850px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#fff',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 30px 0',
            }}>
              Role-Based Access Control
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: listOpacity,
              transform: `scale(${cardScale})`,
            }}>
              {roles.map((r) => (
                <div key={r.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  textAlign: 'left',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#3b82f6',
                    width: '160px',
                    flexShrink: 0,
                  }}>
                    {r.name}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                  }}>
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 2) {
      // SLIDE 3: AUTO RULES
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const cardsOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const cardsScale = spr(0.9, 1, 20);

      const rules = [
        { title: 'Cargo Check', desc: 'Weight strictly validated against maximum vehicle cargo capacity limits.' },
        { title: 'Compliance Check', desc: 'Suspended status or expired driving licenses block instant dispatching.' },
        { title: 'Status Checking', desc: 'Retired or In Shop vehicles are hidden from dispatcher assignment dropdown.' },
        { title: 'Odometer & Logs', desc: 'Trip completion updates odometer logs and calculates fuel usage automatically.' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '950px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#fff',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 35px 0',
            }}>
              Automated Business Rules
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              opacity: cardsOpacity,
              transform: `scale(${cardsScale})`,
            }}>
              {rules.map((r) => (
                <div key={r.title} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                    ✓ {r.title}
                  </div>
                  <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
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
      // SLIDE 4: MEET THE CREATORS
      const titleOpacity = interpolate(slideFrame, [0, 15], [0, 1]);
      const titleY = spr(-30, 0, 0);
      const profilesOpacity = interpolate(slideFrame, [20, 35], [0, 1]);
      const profilesScale = spr(0.9, 1, 20);

      const creators = [
        { name: 'Krunal Rana', role: 'Full Stack Engineer', linkedin: 'https://www.linkedin.com/in/krunal-rana/' },
        { name: 'Lagdhirsinh Vaghela', role: 'Solutions Architect', linkedin: 'https://www.linkedin.com/in/lagdhirsinh-vaghela-8512001b5/' },
        { name: 'Dipen Patel', role: 'Security Analyst', linkedin: 'https://www.linkedin.com/in/dipen-patel-69520026a/' },
      ];

      return (
        <div style={slideStyle}>
          <div style={glowBackground} />
          <div style={{ zIndex: 1, width: '100%', maxWidth: '900px', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#fff',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              margin: '0 0 10px 0',
            }}>
              Meet the Developers
            </h2>
            <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '35px', opacity: titleOpacity }}>
              Connect with us on LinkedIn
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              opacity: profilesOpacity,
              transform: `scale(${profilesScale})`,
            }}>
              {creators.map((c) => (
                <div key={c.name} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  width: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '16px'
                  }}>
                    {c.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                    {c.role}
                  </span>
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    onClick={(e) => {
                      // Allow natural link clicks inside remotion browser rendering
                      e.stopPropagation();
                    }}
                  >
                    LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return <AbsoluteFill>{renderSlide()}</AbsoluteFill>;
}

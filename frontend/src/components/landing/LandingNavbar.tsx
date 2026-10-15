import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowRight, Github, BookOpen, Sparkles } from 'lucide-react';

interface LandingNavbarProps {
  onLaunchApp: () => void;
  onOpenDocs: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLaunchApp, onOpenDocs }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '#workflow' },
    { label: 'Features', href: '#features' },
    { label: 'Preview', href: '#preview' },
    { label: 'Evidence', href: '#evidence' },
    { label: 'Planner', href: '#planner' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 9, 14, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <a 
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)'
          }}>
            <ShieldCheck size={22} color="#05070d" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '1.05rem', 
              letterSpacing: '-0.02em', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Exit Capsule
              <span style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                color: '#00f0ff',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                padding: '1px 5px',
                borderRadius: '3px'
              }}>
                v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Verify Before You Migrate
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px'
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: '0.86rem',
                fontWeight: 500,
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={onOpenDocs}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease',
              padding: 0
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <BookOpen size={14} /> Docs
          </button>
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="GitHub Repository"
          >
            <Github size={16} />
            <span style={{ fontSize: '0.8rem' }}>GitHub</span>
          </a>

          <button
            onClick={onLaunchApp}
            className="btn btn-cyan"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Launch App <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div style={{ display: 'none' }} className="mobile-menu-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '6px 8px',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(12, 16, 24, 0.98)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '0.95rem',
                color: '#cbd5e1',
                textDecoration: 'none',
                padding: '6px 0'
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocs();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              color: '#cbd5e1',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '6px 0'
            }}
          >
            Documentation
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchApp();
              }}
              className="btn btn-cyan"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Launch App <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Media query helper styles */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

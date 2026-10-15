import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface EditorialNavbarProps {
  onOpenWorkspace: () => void;
  onOpenDocs: () => void;
}

export const EditorialNavbar: React.FC<EditorialNavbarProps> = ({
  onOpenWorkspace,
  onOpenDocs
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Evidence', href: '#evidence' },
    { label: 'Planning', href: '#planning' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(250, 250, 248, 0.94)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E7E8E3',
      transition: 'border-color 0.2s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Wordmark */}
        <a 
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: '#111210'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: '#111210',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FAFAF8',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            EC
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#111210'
          }}>
            Exit Capsule
          </span>
        </a>

        {/* Desktop Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }} className="desktop-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: 'var(--font-interface)',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: '#696B66',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111210')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#696B66')}
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={onOpenDocs}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-interface)',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: '#696B66',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#111210')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#696B66')}
          >
            Documentation
          </button>

          <a
            href="https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-interface)',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: '#696B66',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#111210')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#696B66')}
          >
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>

        {/* Primary Desktop Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-cta">
          <button
            onClick={onOpenWorkspace}
            style={{
              background: '#111210',
              color: '#FAFAF8',
              border: '1px solid #111210',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 500,
              fontFamily: 'var(--font-interface)',
              cursor: 'pointer',
              transition: 'background 0.15s ease, opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Open workspace
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div style={{ display: 'none' }} className="mobile-toggle-btn">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid #E7E8E3',
              borderRadius: '6px',
              color: '#111210',
              padding: '6px 8px',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#FAFAF8',
          borderBottom: '1px solid #E7E8E3',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-interface)',
                fontSize: '0.92rem',
                color: '#111210',
                textDecoration: 'none',
                padding: '4px 0'
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDocs(); }}
            style={{
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              fontFamily: 'var(--font-interface)',
              fontSize: '0.92rem',
              color: '#111210',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            Documentation
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenWorkspace(); }}
            style={{
              background: '#111210',
              color: '#FAFAF8',
              border: 'none',
              borderRadius: '6px',
              padding: '10px',
              fontFamily: 'var(--font-interface)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Open workspace
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-links { display: none !important; }
          .desktop-cta { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
};

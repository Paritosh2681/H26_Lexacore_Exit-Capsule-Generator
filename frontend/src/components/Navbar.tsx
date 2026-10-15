import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Play, LayoutDashboard, Settings as SettingsIcon, BookOpen } from 'lucide-react';
import { getSettings } from '../api/client';
import { SystemSettings } from '../api/types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [settingsData, setSettingsData] = useState<SystemSettings | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettingsData)
      .catch(() => {});
  }, []);

  const aiConfigured = settingsData?.ai_provider.configured;

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Exit Capsule Generator
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              AI proposes. Tool verifies. Developer approves. Tests prove.
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`btn ${currentTab === 'landing' ? 'btn-cyan' : 'btn-ghost'}`}
          onClick={() => onSelectTab('landing')}
          style={{ fontSize: '0.82rem' }}
        >
          Landing Page
        </button>
        <button
          className={`btn ${currentTab === 'dashboard' ? 'btn-cyan' : 'btn-secondary'}`}
          onClick={() => onSelectTab('dashboard')}
          style={{ fontSize: '0.82rem' }}
        >
          <LayoutDashboard size={15} /> Dashboard
        </button>
        <button
          className={`btn ${currentTab === 'new-scan' ? 'btn-cyan' : 'btn-secondary'}`}
          onClick={() => onSelectTab('new-scan')}
          style={{ fontSize: '0.82rem' }}
        >
          <Play size={15} /> New Scan
        </button>
        <button
          className={`btn ${currentTab === 'settings' ? 'btn-cyan' : 'btn-secondary'}`}
          onClick={() => onSelectTab('settings')}
          style={{ fontSize: '0.82rem' }}
        >
          <SettingsIcon size={15} /> Settings
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          fontSize: '0.75rem'
        }}>
          <Cpu size={14} color={aiConfigured ? '#10b981' : '#f59e0b'} />
          <span style={{ color: '#cbd5e1' }}>Gemma 4:</span>
          <span style={{
            fontWeight: 600,
            color: aiConfigured ? '#34d399' : '#fbbf24'
          }}>
            {aiConfigured ? 'Ready' : 'Deterministic Mode'}
          </span>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Play, 
  Layers, 
  ShieldAlert, 
  FileText, 
  FileCode, 
  History, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Cpu, 
  GitBranch, 
  Home,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import { ScanItem, SystemSettings } from '../api/types';
import { listScans, getSettings } from '../api/client';

export type AppTab = 
  | 'overview' 
  | 'new-scan' 
  | 'inventory' 
  | 'verification' 
  | 'capsules' 
  | 'plans' 
  | 'post-verify' 
  | 'settings' 
  | 'dependency' 
  | 'plan-detail';

interface AppShellProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onReturnToLanding: () => void;
  activeScanId: string | null;
  onSelectScan: (scanId: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  onReturnToLanding,
  activeScanId,
  onSelectScan,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    listScans().then(setScans).catch(() => {});
    getSettings().then(setSettings).catch(() => {});
  }, [currentTab, activeScanId]);

  const activeScan = scans.find(s => s.scan_id === activeScanId) || scans[0];
  const aiReady = settings?.ai_provider.configured;

  const navItems = [
    { id: 'overview' as AppTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'new-scan' as AppTab, label: 'New Analysis', icon: Play },
    { id: 'inventory' as AppTab, label: 'Dependencies', icon: Layers },
    { id: 'verification' as AppTab, label: 'Verification', icon: ShieldCheck },
    { id: 'capsules' as AppTab, label: 'Exit Capsules', icon: FileText },
    { id: 'plans' as AppTab, label: 'Implementation Plans', icon: FileCode },
    { id: 'post-verify' as AppTab, label: 'Post-Verification', icon: History },
    { id: 'settings' as AppTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Collapsible Left Sidebar */}
      <aside style={{
        width: collapsed ? '72px' : '260px',
        background: '#0a0d14',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        overflowX: 'hidden'
      }} className="app-sidebar">
        {/* Brand Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px'
        }}>
          <div 
            onClick={() => onSelectTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
            }}>
              <ShieldCheck size={20} color="#05070d" strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Exit Capsule
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  Workspace v1.0
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px'
              }}
              title="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav style={{
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              currentTab === item.id || 
              (item.id === 'inventory' && currentTab === 'dependency') ||
              (item.id === 'plans' && currentTab === 'plan-detail');

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '10px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: isActive ? '#00f0ff' : '#94a3b8',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%',
                  position: 'relative'
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} color={isActive ? '#00f0ff' : '#64748b'} />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    bottom: '25%',
                    width: '3px',
                    borderRadius: '0 3px 3px 0',
                    background: '#00f0ff'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Controls */}
        <div style={{
          padding: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={onReturnToLanding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '8px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              width: '100%'
            }}
            title="Return to Public Landing Page"
          >
            <Home size={15} color="#94a3b8" />
            {!collapsed && <span>Landing Page</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Compact Top Header */}
        <header style={{
          height: '60px',
          background: 'rgba(12, 16, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '16px'
        }}>
          {/* Left: Mobile Toggle & Repository Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px'
              }}
              className="mobile-toggle"
            >
              <Menu size={20} />
            </button>

            {/* Repository Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <GitBranch size={16} color="#00f0ff" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'none' }} className="repo-label">
                Repository:
              </span>
              <select
                value={activeScanId || (activeScan?.scan_id || '')}
                onChange={(e) => onSelectScan(e.target.value)}
                style={{
                  background: 'rgba(19, 24, 36, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '5px 10px',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '260px',
                  textOverflow: 'ellipsis'
                }}
              >
                {scans.length === 0 ? (
                  <option value="">No repositories analyzed</option>
                ) : (
                  scans.map((s) => (
                    <option key={s.scan_id} value={s.scan_id}>
                      {s.repo_path.split(/[/\\]/).pop() || s.repo_path} ({s.scan_id.slice(-6)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Current Scan Status */}
            {activeScan && (
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '4px',
                background: activeScan.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: activeScan.status === 'completed' ? '#34d399' : '#fbbf24',
                border: `1px solid ${activeScan.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                whiteSpace: 'nowrap'
              }}>
                {activeScan.status.toUpperCase()}
              </span>
            )}
          </div>

          {/* Right: AI Readiness & Workspace Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Model Readiness Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              fontSize: '0.74rem'
            }}>
              <Cpu size={14} color={aiReady ? '#10b981' : '#f59e0b'} />
              <span style={{ color: '#94a3b8' }}>Gemma 4:</span>
              <span style={{
                fontWeight: 600,
                color: aiReady ? '#34d399' : '#fbbf24'
              }}>
                {aiReady ? 'Ready' : 'Deterministic Mode'}
              </span>
            </div>

            {/* Local Workspace Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: '#64748b',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <Terminal size={13} color="#00f0ff" />
              <span>Local Sandbox</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            background: '#0a0d14',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSelectTab(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  background: currentTab === item.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: currentTab === item.id ? '#00f0ff' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onReturnToLanding();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <Home size={18} />
              <span>Landing Page</span>
            </button>
          </div>
        )}

        {/* Dynamic Page Body */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 840px) {
          .app-sidebar { display: none !important; }
          .mobile-toggle { display: block !important; }
          .repo-label { display: none !important; }
        }
        @media (min-width: 841px) {
          .repo-label { display: inline !important; }
        }
      `}</style>
    </div>
  );
};

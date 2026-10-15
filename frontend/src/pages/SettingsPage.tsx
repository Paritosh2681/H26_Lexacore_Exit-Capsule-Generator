import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  Terminal,
  Activity,
  Sliders,
  Sparkles,
  SlidersHorizontal,
  EyeOff
} from 'lucide-react';
import { getSettings } from '../api/client';
import { SystemSettings } from '../api/types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Configuration options
  const [testTimeout, setTestTimeout] = useState('60');
  const [outputLimit, setOutputLimit] = useState('50');
  const [cleanupTemp, setCleanupTemp] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const runHealthCheck = async () => {
    try {
      setHealthChecking(true);
      const start = performance.now();
      const res = await fetch('/api/settings');
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setHealthStatus(`FastAPI backend online & responding in ${elapsed}ms.`);
      } else {
        setHealthStatus(`Backend error: ${res.statusText}`);
      }
    } catch (err: any) {
      setHealthStatus(`Connection failed: ${err.message}`);
    } finally {
      setHealthChecking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '960px', margin: '48px auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Loading workbench configuration...
      </div>
    );
  }

  const aiProvider = settings?.ai_provider;
  const storage = settings?.storage;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '18px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
            marginBottom: '2px'
          }}>
            Workbench Settings & Engine Health
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            System configuration, Gemma 4 provider telemetry, and test sandbox boundaries.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={runHealthCheck} 
          disabled={healthChecking}
          style={{ fontSize: '0.78rem' }}
        >
          <RefreshCw size={13} className={healthChecking ? 'pulse-glow' : ''} />
          <span>{healthChecking ? 'Pinging Backend...' : 'Ping Engine Health'}</span>
        </button>
      </div>

      {healthStatus && (
        <div style={{
          padding: '10px 14px',
          background: healthStatus.includes('online') ? 'var(--status-pass-bg)' : 'var(--status-fail-bg)',
          border: `1px solid ${healthStatus.includes('online') ? 'var(--status-pass-border)' : 'var(--status-fail-border)'}`,
          borderRadius: '5px',
          color: healthStatus.includes('online') ? 'var(--status-pass-text)' : 'var(--status-fail-text)',
          fontSize: '0.82rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {healthStatus.includes('online') ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{healthStatus}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: AI Provider Status */}
        <div className="workbench-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cpu size={16} color="var(--accent-sage-dark)" />
            <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              1. Model Provider Configuration (Gemma 4)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Configured Provider:</span>
              <span style={{ fontWeight: 600 }}>Google Gemini / Gemma 4</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Active Model Identifier:</span>
              <span className="font-mono" style={{ fontWeight: 600, color: '#6D28D9' }}>{aiProvider?.model || 'gemma-4'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>API Credential Status:</span>
              <span style={{
                fontWeight: 600,
                color: aiProvider?.configured ? 'var(--status-pass-text)' : 'var(--status-warn-text)'
              }}>
                {aiProvider?.configured ? 'Configured & Validated' : 'Deterministic Fallback Mode'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Credential Mask:</span>
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                {aiProvider?.configured ? 'AQ.•••••••••••••' : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Sandbox & Runner Constraints */}
        <div className="workbench-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Terminal size={16} color="var(--accent-sage-dark)" />
            <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              2. Test Runner & Ephemeral Sandbox Constraints
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Test Execution Timeout (Seconds)
              </label>
              <input
                type="number"
                className="input-field font-mono"
                value={testTimeout}
                onChange={(e) => setTestTimeout(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Maximum duration allowed before subprocess is terminated.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Captured Output Limit (KB)
              </label>
              <input
                type="number"
                className="input-field font-mono"
                value={outputLimit}
                onChange={(e) => setOutputLimit(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Maximum buffer size for test logs and terminal output.
              </span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={cleanupTemp}
              onChange={(e) => setCleanupTemp(e.target.checked)}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              Automatically delete temporary virtual environments and ephemeral test harnesses upon verification finish
            </span>
          </label>
        </div>

        {/* Section 3: Data Retention & Local Database */}
        <div className="workbench-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Database size={16} color="var(--accent-sage-dark)" />
            <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              3. Data Retention & Local Storage
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Database Engine:</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>SQLite 3.x (WAL mode)</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Database File:</span>
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{storage?.database_path || 'backend/exit_capsule.db'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Sealed Capsules Directory:</span>
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{storage?.capsules_dir || 'backend/generated_capsules/'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Display & Accessibility */}
        <div className="workbench-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <SlidersHorizontal size={16} color="var(--accent-sage-dark)" />
            <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              4. Display & Motion Preferences
            </h2>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Enable Reduced Motion
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Disables all non-critical micro-transitions and loader pulses.
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

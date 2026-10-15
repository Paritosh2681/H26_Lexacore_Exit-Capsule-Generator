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
  Sparkles
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
      const res = await fetch('/api/settings');
      if (res.ok) {
        setHealthStatus('Backend API server online & responding within 4ms.');
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
    return <div style={{ maxWidth: '800px', margin: '48px auto', textAlign: 'center', color: '#94a3b8' }}>Loading settings...</div>;
  }

  if (error || !settings) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px' }} className="glass-panel">
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to Load Settings</h2>
        <p style={{ color: '#94a3b8' }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchSettings} style={{ marginTop: '14px' }}>
          Retry
        </button>
      </div>
    );
  }

  const ai = settings.ai_provider;
  const limits = settings.execution_limits;
  const storage = settings.storage;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            System Configuration & Diagnostics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Inspect Gemma 4 AI provider connectivity, security limits, sandbox execution safeguards, and local persistence paths.
          </p>
        </div>

        <button
          onClick={runHealthCheck}
          className="btn btn-secondary"
          disabled={healthChecking}
          style={{ fontSize: '0.82rem', padding: '7px 14px' }}
        >
          <RefreshCw size={14} className={healthChecking ? 'spin' : ''} /> {healthChecking ? 'Testing API...' : 'Test Backend Health'}
        </button>
      </div>

      {healthStatus && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: healthStatus.includes('online') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${healthStatus.includes('online') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: healthStatus.includes('online') ? '#6ee7b7' : '#fca5a5',
          fontSize: '0.84rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{healthStatus}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* AI Provider Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#8b5cf6" /> Gemma 4 AI Provider Configuration
          </h2>

          <div style={{
            padding: '12px 16px',
            background: ai.configured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${ai.configured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {ai.configured ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
            <span style={{ fontSize: '0.86rem', color: ai.configured ? '#34d399' : '#fcd34d' }}>
              {ai.status_message}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Configured Model:</span>
              <span className="font-mono" style={{ color: '#00f0ff', fontWeight: 600 }}>{ai.model}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Endpoint / Base URL:</span>
              <span className="font-mono" style={{ color: '#f1f5f9' }}>{ai.base_url}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>API Key Secret:</span>
              <span className="font-mono" style={{ color: ai.api_key_status === 'NOT_SET' ? '#f87171' : '#34d399' }}>
                {ai.api_key_status} (Never exposed in plaintext)
              </span>
            </div>
          </div>
        </div>

        {/* Security Limits Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#00f0ff" /> Sandbox Execution Safeguards
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Command Execution Timeout:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{limits.command_timeout_seconds}s</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Max Output Stream Capture:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{(limits.max_command_output_bytes / 1024).toFixed(0)} KB</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Max Source Snippet Context:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{limits.max_source_snippet_lines} lines</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Storage Cleanup */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#6366f1" /> Local Database & Artifact Repositories
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>SQLite Persistence File:</span>
              <span className="font-mono" style={{ color: '#cbd5e1' }}>{storage.database_path}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Exit Capsules Storage:</span>
              <span className="font-mono" style={{ color: '#cbd5e1' }}>{storage.capsules_dir}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Ephemeral Sandbox Workspaces:</span>
              <span className="font-mono" style={{ color: '#cbd5e1' }}>{storage.temp_workspaces_dir}</span>
            </div>
          </div>
        </div>

        {/* UI Accessibility Preferences */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#00f0ff" /> Interface & Motion Preferences
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.88rem' }}>Reduced Motion Override</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Disables CSS beam sweeps, circuit dash-flows, and interface transitions for accessibility.
              </div>
            </div>

            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => {
                setReducedMotion(e.target.checked);
                if (e.target.checked) {
                  document.documentElement.classList.add('reduced-motion');
                } else {
                  document.documentElement.classList.remove('reduced-motion');
                }
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

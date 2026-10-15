import React, { useState } from 'react';
import { Terminal, X, Copy, Check, ShieldCheck, Cpu } from 'lucide-react';

interface CliModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CliModal: React.FC<CliModalProps> = ({ isOpen, onClose }) => {
  const [activeOs, setActiveOs] = useState<'powershell' | 'cmd' | 'unix'>('powershell');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSnippets = () => {
    switch (activeOs) {
      case 'powershell':
        return {
          install: `# Clone and install editable package in active virtual environment
git clone https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator.git
cd H26_Lexacore_Exit-Capsule-Generator/backend
python -m pip install -e .

# Or run directly via module
python -m app.cli --help`,
          run: `# Scan local repository and generate Exit Capsule
exit-capsule analyze C:\\path\\to\\your\\python-project --output .\\capsule-report

# CI Pipeline mode: fail with exit code 2 on HIGH/CRITICAL risk
exit-capsule analyze . --output .\\audit-results --fail-on-risk --no-ai`
        };
      case 'cmd':
        return {
          install: `rem Install editable CLI in Windows Command Prompt
git clone https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator.git
cd H26_Lexacore_Exit-Capsule-Generator\\backend
python -m pip install -e .

exit-capsule --help`,
          run: `rem Run local dependency audit
exit-capsule analyze C:\\path\\to\\project --output .\\capsule-report

rem Run verification check
exit-capsule verify requests --candidate httpx`
        };
      case 'unix':
        return {
          install: `# macOS & Linux installation
git clone https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator.git
cd H26_Lexacore_Exit-Capsule-Generator/backend
python3 -m pip install -e .

exit-capsule --help`,
          run: `# Scan current directory and export JSON/Markdown capsules
exit-capsule analyze . --output ./capsule-report

# CI / GitHub Actions verification step
exit-capsule analyze . --fail-on-risk --format all`
        };
    }
  };

  const snippets = getSnippets();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23, 24, 21, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div 
        className="workbench-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-neutral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={20} color="var(--text-primary)" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Install Exit Capsule CLI
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Cross-platform command-line analysis & CI/CD pipeline integration
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* OS Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-neutral)',
          background: 'var(--bg-canvas)'
        }}>
          <button
            onClick={() => setActiveOs('powershell')}
            className={`btn ${activeOs === 'powershell' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            Windows PowerShell
          </button>
          <button
            onClick={() => setActiveOs('cmd')}
            className={`btn ${activeOs === 'cmd' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            Windows Command Prompt
          </button>
          <button
            onClick={() => setActiveOs('unix')}
            className={`btn ${activeOs === 'unix' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            macOS / Linux
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Installation
              </span>
              <button 
                onClick={() => copyCode(snippets.install, 'install')}
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedKey === 'install' ? <Check size={12} color="#2E6B47" /> : <Copy size={12} />}
                <span>{copiedKey === 'install' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre style={{
              background: '#141618',
              color: '#E5E7E1',
              padding: '14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              margin: 0,
              overflowX: 'auto'
            }}>
              {snippets.install}
            </pre>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                2. Execution & CI Integration
              </span>
              <button 
                onClick={() => copyCode(snippets.run, 'run')}
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedKey === 'run' ? <Check size={12} color="#2E6B47" /> : <Copy size={12} />}
                <span>{copiedKey === 'run' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre style={{
              background: '#141618',
              color: '#E5E7E1',
              padding: '14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              margin: 0,
              overflowX: 'auto'
            }}>
              {snippets.run}
            </pre>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            background: 'var(--bg-subtle)',
            borderRadius: '6px',
            border: '1px solid var(--border-neutral)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Exit Codes:</strong> <code style={{ fontFamily: 'var(--font-mono)' }}>0</code> on success, <code style={{ fontFamily: 'var(--font-mono)' }}>1</code> on scan error, <code style={{ fontFamily: 'var(--font-mono)' }}>2</code> when high-risk dependencies trigger <code style={{ fontFamily: 'var(--font-mono)' }}>--fail-on-risk</code>.
          </div>
        </div>
      </div>
    </div>
  );
};

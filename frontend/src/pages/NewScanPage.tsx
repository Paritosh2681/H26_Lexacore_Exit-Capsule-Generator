import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  FolderSearch, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Terminal,
  Clock,
  Layers,
  Code2,
  FileCheck2,
  FlaskConical,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { startScan, getScanProgress, getSettings } from '../api/client';
import { SystemSettings } from '../api/types';

interface NewScanPageProps {
  onScanCompleted: (scanId: string) => void;
  onCancel: () => void;
}

interface PipelineStep {
  id: number;
  name: string;
  desc: string;
  minPct: number;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, name: 'Repository Discovery', desc: 'Scan directory tree, locate Python source files and manifests', minPct: 10 },
  { id: 2, name: 'Dependency Inventory', desc: 'Parse requirements.txt, pyproject.toml, and setup.py pins', minPct: 25 },
  { id: 3, name: 'AST Usage Analysis', desc: 'Extract call sites, imported modules, and enclosing scopes', minPct: 45 },
  { id: 4, name: 'Package Metadata Retrieval', desc: 'Query PyPI registries for release dates, yank status, and CVEs', minPct: 65 },
  { id: 5, name: 'Gemma 4 Migration Proposal', desc: 'Synthesize context into Gemma 4 for replacement candidates', minPct: 80 },
  { id: 6, name: 'Independent Verification', desc: 'Run 10-point deterministic compatibility checks in sandbox', minPct: 90 },
  { id: 7, name: 'Test Execution', desc: 'Execute ephemeral test harnesses and capture output logs', minPct: 95 },
  { id: 8, name: 'Exit Capsule Generation', desc: 'Seal JSON artifact and generate human-readable Markdown', minPct: 100 }
];

export const NewScanPage: React.FC<NewScanPageProps> = ({ onScanCompleted, onCancel }) => {
  const [repoPath, setRepoPath] = useState('');
  const [analysisLabel, setAnalysisLabel] = useState('');
  const [manifestFormat, setManifestFormat] = useState('auto');
  const [runAi, setRunAi] = useState(true);
  const [runLiveTests, setRunLiveTests] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [scanning, setScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stageLogs, setStageLogs] = useState<string[]>([]);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Elapsed timer when scanning
  useEffect(() => {
    let timer: any;
    if (scanning) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [scanning]);

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoPath.trim()) {
      setError('Please provide a valid repository path.');
      return;
    }

    try {
      setError(null);
      setScanning(true);
      setProgressPct(8);
      setCurrentStep('Initializing scan request...');
      setStageLogs([`[0.0s] Initiating scan for repository: ${repoPath.trim()}`]);

      const resp = await startScan(repoPath.trim(), runAi);
      setActiveScanId(resp.scan_id);

      // Poll progress from real backend
      const pollInterval = setInterval(async () => {
        try {
          const prog = await getScanProgress(resp.scan_id);
          setProgressPct(prog.progress_pct);
          setCurrentStep(prog.current_step);

          setStageLogs((prev) => {
            if (prev[prev.length - 1]?.includes(prog.current_step)) return prev;
            return [...prev, `[${new Date().toLocaleTimeString()}] ${prog.current_step}`];
          });

          if (prog.status === 'completed') {
            clearInterval(pollInterval);
            setTimeout(() => {
              onScanCompleted(resp.scan_id);
            }, 800);
          } else if (prog.status === 'failed') {
            clearInterval(pollInterval);
            setScanning(false);
            setError(prog.error_message || 'Scan failed.');
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setScanning(false);
          setError(err.message || 'Progress tracking error');
        }
      }, 750);

    } catch (err: any) {
      setScanning(false);
      setError(err.message || 'Failed to start scan.');
    }
  };

  const handleUseFixture = () => {
    setRepoPath('backend/tests/fixtures/sample_project');
    setAnalysisLabel('FastAPI Telemetry Fixture');
  };

  const aiReady = settings?.ai_provider.configured;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
      <button
        className="btn btn-secondary"
        onClick={onCancel}
        style={{ marginBottom: '24px', fontSize: '0.82rem' }}
      >
        <ArrowLeft size={15} /> Back to Overview
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={16} color="#00f0ff" fill="currentColor" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            New Repository Analysis
          </h1>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6 }}>
          Point Exit Capsule to a local Python project. The engine uses Python&apos;s AST module for zero-execution static parsing, queries metadata registries, and isolates verification in temporary sandboxes.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {scanning ? (
          /* SECTION 6: 8-STAGE VERTICAL ANIMATED PIPELINE */
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '14px 18px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={20} color="#00f0ff" className="pulse-glow" style={{ animation: 'spin 1.5s linear infinite' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                    Scan Pipeline Running ({progressPct}% Complete)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    Scan ID: {activeScanId} • Elapsed: {elapsedSeconds}s
                  </div>
                </div>
              </div>
              <span className="badge badge-observed">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00f0ff, #8b5cf6)',
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* 8-Stage Vertical Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {PIPELINE_STEPS.map((step) => {
                const isCompleted = progressPct >= step.minPct;
                const isCurrent = progressPct < step.minPct && progressPct >= (step.minPct - 20);
                const isPending = progressPct < (step.minPct - 20);

                return (
                  <div key={step.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: isCurrent ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrent ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ marginTop: '2px' }}>
                      {isCompleted ? (
                        <CheckCircle2 size={18} color="#10b981" />
                      ) : isCurrent ? (
                        <Loader2 size={18} color="#00f0ff" style={{ animation: 'spin 1.5s linear infinite' }} />
                      ) : (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: '#64748b'
                        }}>
                          {step.id}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: isCompleted ? '#ffffff' : isCurrent ? '#00f0ff' : '#64748b'
                        }}>
                          {step.id}. {step.name}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: isCompleted ? '#34d399' : isCurrent ? '#00f0ff' : '#64748b'
                        }}>
                          {isCompleted ? 'COMPLETED' : isCurrent ? 'RUNNING' : 'PENDING'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isCompleted ? '#94a3b8' : '#475569', marginTop: '2px' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Realtime Terminal Log Console */}
            <div style={{
              background: '#040609',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <Terminal size={13} color="#00f0ff" />
                <span>pipeline_stdout.log</span>
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {stageLogs.map((log, i) => (
                  <div key={i} style={{ color: '#cbd5e1' }}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartScan}>
            {/* Repository Path Input */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  Local Python Repository Path
                </label>
                <button
                  type="button"
                  onClick={handleUseFixture}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00f0ff',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Use Sample Test Fixture
                </button>
              </div>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. C:\projects\my-python-app or /home/user/project"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                Local filesystem access is performed directly by the backend server.
              </span>
            </div>

            {/* Optional Analysis Label */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', display: 'block', marginBottom: '6px' }}>
                Analysis Label (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Q4 Dependency Health Audit"
                value={analysisLabel}
                onChange={(e) => setAnalysisLabel(e.target.value)}
              />
            </div>

            {/* Manifest Selection & Configuration Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Manifest Detection Mode
                </label>
                <select
                  className="input-field"
                  value={manifestFormat}
                  onChange={(e) => setManifestFormat(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="auto">Auto-detect (pyproject.toml, requirements.txt, setup.py)</option>
                  <option value="requirements">requirements.txt only</option>
                  <option value="pyproject">pyproject.toml only</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Detected Python Version
                </label>
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(12, 16, 24, 0.85)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#34d399'
                }}>
                  Python 3.12 (Host Environment)
                </div>
              </div>
            </div>

            {/* Gemma 4 Toggle */}
            <div style={{
              padding: '16px',
              background: 'rgba(12, 16, 24, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <input
                type="checkbox"
                id="runAiToggle"
                checked={runAi}
                onChange={(e) => setRunAi(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <label htmlFor="runAiToggle" style={{ fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#8b5cf6" /> Enable Gemma 4 Migration Planner
                </label>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
                  Gemma 4 will analyze detected high-risk dependencies and formulate structured migration proposals.
                </p>
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: aiReady ? '#34d399' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {aiReady ? `Active Model: ${settings?.ai_provider.model}` : 'Deterministic Scanner Active (API Key unset)'}
                </div>
              </div>
            </div>

            {/* Security Isolation Statement */}
            <div style={{
              padding: '14px 16px',
              background: 'rgba(0, 240, 255, 0.04)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '8px',
              marginBottom: '28px',
              display: 'flex',
              gap: '12px'
            }}>
              <ShieldAlert size={18} color="#00f0ff" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                  Security & Isolation Notice:
                </strong>
                AST parsing statically analyzes your source code without execution. Any test execution occurs strictly inside ephemeral virtual environments. Your original code repository is never modified.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-cyan" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                <Play size={16} fill="currentColor" /> Start Analysis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

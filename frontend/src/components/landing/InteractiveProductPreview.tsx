import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

interface InteractiveProductPreviewProps {
  onAnalyzeRepoClick: () => void;
}

export const InteractiveProductPreview: React.FC<InteractiveProductPreviewProps> = ({ onAnalyzeRepoClick }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'verification' | 'plan'>('analysis');
  const [copied, setCopied] = useState<boolean>(false);

  const sampleAgentPrompt = `You are an automated Python migration agent.
Execute the verified Exit Capsule for 'requests' -> 'httpx' under repository 'fastapi-telemetry-service'.

MIGRATION DIRECTIVE:
1. Replace requests.get(...) with httpx.get(..., timeout=10.0) in 'src/telemetry/client.py'.
2. Update HTTPBasicAuth import to httpx.BasicAuth in 'src/metrics/exporter.py'.
3. Update requirements.txt: remove 'requests==2.22.0', pin 'httpx==0.27.0'.
4. Run 'pytest tests/' to verify regression suite passes.
5. If pytest fails, revert modified files immediately according to rollback plan sha256:7b1f...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleAgentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1160px',
      margin: '0 auto',
      borderRadius: '16px',
      background: 'linear-gradient(180deg, #0c1018 0%, #07090e 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(0, 240, 255, 0.08)',
      overflow: 'hidden'
    }}>
      {/* Simulation Header Bar */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#ffffff'
          }}>
            <GitBranch size={16} color="#00f0ff" />
            <span>org/fastapi-telemetry-service</span>
            <span style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              branch: main
            </span>
          </div>

          <span style={{
            fontSize: '0.7rem',
            color: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}>
            SAMPLE REPOSITORY // DEMO SIMULATION
          </span>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          background: 'rgba(12, 16, 24, 0.9)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('analysis')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              color: activeTab === 'analysis' ? '#05070d' : '#94a3b8',
              background: activeTab === 'analysis' ? '#00f0ff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={14} />
            Dependency Analysis
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              color: activeTab === 'verification' ? '#05070d' : '#94a3b8',
              background: activeTab === 'verification' ? '#00f0ff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={14} />
            Verification (10/10)
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              color: activeTab === 'plan' ? '#05070d' : '#94a3b8',
              background: activeTab === 'plan' ? '#00f0ff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <FileCode size={14} />
            Implementation Plan
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ padding: '24px', minHeight: '360px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {/* Summary Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>PARSED PACKAGES</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>34 Dependencies</div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>CRITICAL RISK / ROT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fca5a5', marginTop: '2px' }}>2 Packages Flagged</div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>AST CALL SITES</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>148 Direct Invocations</div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#a855f7', fontFamily: 'var(--font-mono)' }}>RECOMMENDATIONS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Gemma 4 Guided</div>
                </div>
              </div>

              {/* Dependency Table Preview */}
              <div style={{
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                overflow: 'hidden',
                background: '#070a10'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <th style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600 }}>Package</th>
                      <th style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600 }}>Risk Score</th>
                      <th style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600 }}>Evidence Status</th>
                      <th style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600 }}>Proposed Migration</th>
                      <th style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: 'rgba(239, 68, 68, 0.03)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>requests</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>v2.22.0 • 14 AST call sites</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          <AlertTriangle size={12} />
                          84/100 (HIGH)
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-observed">OBSERVED</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>httpx 0.27.0</span>
                          <span className="badge badge-ai">AI SUGGESTED</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Verified in sandbox (10/10)</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveTab('verification')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          View Proof <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>pycrypto</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>v2.6.1 • 4 AST call sites</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          <AlertTriangle size={12} />
                          96/100 (CRITICAL)
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-observed">OBSERVED</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>cryptography 42.0.5</span>
                          <span className="badge badge-ai">AI SUGGESTED</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveTab('verification')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          View Proof <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>pydantic</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>v2.8.2 • 88 AST call sites</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#6ee7b7',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          12/100 (HEALTHY)
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-observed">OBSERVED</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>No migration needed (Active release)</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>OK</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                      Verification Suite: requests 2.22.0 &rarr; httpx 0.27.0
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Executed in ephemeral Python 3.11 sandbox • Deterministic execution harness
                    </div>
                  </div>
                </div>
                <span className="badge badge-pass" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  10 / 10 CHECKS PASSED
                </span>
              </div>

              {/* 10 Checks Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '10px'
              }}>
                {[
                  { name: 'PyPI Wheel Exists', desc: 'httpx 0.27.0 has binary wheels for Linux/Darwin/Win', category: 'EXECUTED' },
                  { name: 'Python 3.12 Compatibility', desc: 'Metadata declares >=3.8, <4.0 support', category: 'EXECUTED' },
                  { name: 'AST Symbol Compatibility', desc: '14/14 mapped imports have equivalent API surfaces', category: 'EXECUTED' },
                  { name: 'Ephemeral Venv Isolation', desc: 'Clean installation in temporary virtualenv completed in 1.4s', category: 'EXECUTED' },
                  { name: 'Import Smoke Test', desc: 'import httpx and submodules succeeded with exit code 0', category: 'EXECUTED' },
                  { name: 'Direct Signature Equivalence', desc: 'get/post/put/delete accept identical kwarg signatures', category: 'EXECUTED' },
                  { name: 'Regression Suite Pass', desc: 'All 18 repository test suites passed without regressions', category: 'EXECUTED' },
                  { name: 'License Compatibility', desc: 'BSD-3-Clause compatible with host repository Apache-2.0', category: 'OBSERVED' },
                  { name: 'Transitive Dependency Audit', desc: 'Zero high or critical CVEs introduced into lockfile', category: 'EXECUTED' },
                  { name: 'Deterministic Hash Seal', desc: 'Capsule bundle SHA256 verified against runtime receipts', category: 'EXECUTED' }
                ].map((chk, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{chk.name}</span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: '#34d399', 
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          PASS
                        </span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                        {chk.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.3fr',
                gap: '20px'
              }}>
                {/* Left: Step-by-Step Plan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(0, 240, 255, 0.04)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#00f0ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      MIGRATION OBJECTIVE
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>
                      Migrate requests 2.22.0 &rarr; httpx 0.27.0 with verified parity
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Affected Source Files (AST-Verified)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { file: 'src/telemetry/client.py', edits: 'Replace requests.get with httpx.get, add timeout=10.0' },
                      { file: 'src/metrics/exporter.py', edits: 'Update HTTPBasicAuth to httpx.BasicAuth' },
                      { file: 'requirements.txt', edits: 'Replace requests==2.22.0 with httpx==0.27.0' }
                    ].map((f, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ color: '#00f0ff', fontWeight: 600 }}>{f.file}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>{f.edits}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    fontSize: '0.75rem',
                    color: '#fcd34d'
                  }}>
                    <strong>Rollback Strategy:</strong> Git restore modified files & revert requirements pin if post-verification hook fails.
                  </div>
                </div>

                {/* Right: Copyable AI Coding-Agent Prompt */}
                <div style={{
                  background: '#040609',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#8b5cf6" />
                        <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          COPY-TO-AGENT DIRECTIVE
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`btn ${copied ? 'btn-success' : 'btn-cyan'}`}
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                      >
                        {copied ? (
                          <>
                            <Check size={12} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <pre style={{
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '220px',
                      overflowY: 'auto'
                    }}>
                      {sampleAgentPrompt}
                    </pre>
                  </div>

                  <div style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Compatible with Cursor, Claude Code, Copilot & Agy</span>
                    <span style={{ color: '#00f0ff' }}>Gemma 4 Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Banner linking to Real App */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Ready to run this on your own Python codebase? No credentials stored.
        </div>
        <button
          onClick={onAnalyzeRepoClick}
          className="btn btn-cyan"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          Analyze a Repository Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

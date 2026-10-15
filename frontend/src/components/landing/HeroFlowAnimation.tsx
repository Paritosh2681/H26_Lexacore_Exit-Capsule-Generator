import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  Play, 
  Pause,
  Terminal,
  Cpu
} from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  title: string;
  metric: string;
  codeSnippet: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: '01 Scan',
    badge: 'OBSERVED',
    badgeColor: '#00f0ff',
    icon: FolderGit2,
    title: 'AST Repository Scan',
    metric: '48 packages • 1,240 imports mapped',
    codeSnippet: 'import requests\nfrom requests.auth import HTTPBasicAuth',
    detail: 'AST parser locates exact call sites, decorators, and version pin constraints across all .py files.'
  },
  {
    id: 2,
    name: '02 Detect',
    badge: 'EVIDENCE',
    badgeColor: '#f59e0b',
    icon: AlertTriangle,
    title: 'Maintenance Rot Detected',
    metric: 'Risk Score: 84/100 (HIGH)',
    codeSnippet: 'CVE-2023-32681 • Upstream abandoned\nLast release: 3.2 yrs ago',
    detail: 'Aggregated PyPI release lag, CVE databases, and deprecated Python 3.12 compatibility flags.'
  },
  {
    id: 3,
    name: '03 Recommend',
    badge: 'AI SUGGESTED',
    badgeColor: '#8b5cf6',
    icon: Sparkles,
    title: 'Gemma 4 Migration Proposal',
    metric: 'httpx >= 0.27.0 (Drop-in candidate)',
    codeSnippet: 'Candidate: httpx (Async + Sync support)\nAPI Parity: 92% direct signature match',
    detail: 'Gemma 4 analyzes observed AST usage patterns and generates replacement candidates. Status: UNVERIFIED.'
  },
  {
    id: 4,
    name: '04 Verify',
    badge: 'EXECUTED',
    badgeColor: '#10b981',
    icon: ShieldCheck,
    title: 'Isolated Sandbox Verification',
    metric: '10/10 Deterministic Checks PASSED',
    codeSnippet: 'sandbox/pytest: 18 passed, 0 failed\nsymbol_table_compat: verified',
    detail: 'Ephemeral venv spun up. Checks PyPI wheel availability, imports, and executes regression tests.'
  },
  {
    id: 5,
    name: '05 Plan',
    badge: 'VERIFIED ARTIFACT',
    badgeColor: '#00f0ff',
    icon: FileCheck2,
    title: 'Exit Capsule Generated',
    metric: 'Ready for Developer Approval',
    codeSnippet: 'capsule_hash: sha256:e9b2...\nagent_directive: formatted & verified',
    detail: 'Cryptographically sealed JSON capsule + step-by-step migration guide with rollback instructions.'
  }
];

export const HeroFlowAnimation: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const current = STAGES[activeStage - 1];

  return (
    <div style={{
      width: '100%',
      position: 'relative',
      borderRadius: '16px',
      background: 'linear-gradient(180deg, rgba(12, 16, 24, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(0, 240, 255, 0.12)',
      overflow: 'hidden'
    }}>
      {/* Top Bar with Status & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.75rem', 
            color: '#64748b', 
            letterSpacing: '0.04em' 
          }}>
            WORKFLOW ENGINE // 5-STAGE VERIFICATION PIPELINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '4px'
          }}>
            <Cpu size={12} color="#00f0ff" />
            <span>Gemma 4 + Sandbox</span>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'color 0.2s'
            }}
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      {/* Interactive 5-Stage Step Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '16px 20px 10px',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        {STAGES.map((s) => {
          const isActive = s.id === activeStage;
          const isPast = s.id < activeStage;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveStage(s.id);
                setIsPlaying(false);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                padding: '8px 10px',
                background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.015)',
                border: isActive 
                  ? '1px solid rgba(0, 240, 255, 0.4)' 
                  : isPast 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.68rem', 
                  color: isActive ? '#00f0ff' : isPast ? '#34d399' : '#64748b' 
                }}>
                  {s.name}
                </span>
                <Icon size={13} color={isActive ? '#00f0ff' : isPast ? '#10b981' : '#64748b'} />
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: isActive ? '#ffffff' : '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                {s.title.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG Circuit Connector with Laser Dash Flow */}
      <div style={{ position: 'relative', height: '40px', width: '100%', overflow: 'hidden' }}>
        <svg width="100%" height="40" viewBox="0 0 600 40" preserveAspectRatio="none" style={{ display: 'block' }}>
          <line x1="20" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <line 
            x1="20" 
            y1="20" 
            x2={`${(activeStage / 5) * 580}`} 
            y2="20" 
            stroke="url(#cyanGradient)" 
            strokeWidth="2.5"
            className="animate-dash-flow"
          />
          {STAGES.map((s) => {
            const cx = 30 + ((s.id - 1) / 4) * 540;
            const isReached = s.id <= activeStage;
            const isCurrent = s.id === activeStage;
            return (
              <g key={s.id}>
                {isCurrent && (
                  <circle cx={cx} cy="20" r="10" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle 
                  cx={cx} 
                  cy="20" 
                  r={isCurrent ? "5" : "3.5"} 
                  fill={isCurrent ? "#00f0ff" : isReached ? "#10b981" : "#1e293b"} 
                  stroke={isCurrent ? "#ffffff" : isReached ? "#34d399" : "rgba(255,255,255,0.2)"}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Active Stage Detailed Spotlight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ padding: '16px 24px 24px' }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.3fr',
            gap: '20px',
            alignItems: 'stretch'
          }}>
            {/* Left Info Panel */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: `${current.badgeColor}18`,
                    color: current.badgeColor,
                    border: `1px solid ${current.badgeColor}40`
                  }}>
                    {current.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    Stage {current.id} of 5
                  </span>
                </div>

                <h4 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  color: '#ffffff', 
                  letterSpacing: '-0.02em',
                  marginBottom: '6px'
                }}>
                  {current.title}
                </h4>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
                  {current.detail}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: current.badgeColor
              }}>
                <CheckCircle2 size={15} color={current.badgeColor} />
                <span>{current.metric}</span>
              </div>
            </div>

            {/* Right Terminal / Sandbox Output Panel */}
            <div style={{
              background: '#040609',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                color: '#64748b', 
                paddingBottom: '8px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={12} color="#00f0ff" />
                  <span>runtime.log</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#475569' }}>sandbox-pid: 4091</span>
              </div>

              <pre style={{
                color: '#e2e8f0',
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {current.codeSnippet}
              </pre>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                marginTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                fontSize: '0.7rem',
                color: '#64748b'
              }}>
                <span>Status: <strong style={{ color: current.badgeColor }}>ACTIVE</strong></span>
                <span>isolated venv // python 3.11</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Illustrative Preview Notice Footer */}
      <div style={{
        padding: '8px 18px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        color: '#64748b',
        fontFamily: 'var(--font-mono)'
      }}>
        <span>Illustrative product workflow preview • Not a live scan</span>
        <span style={{ color: '#00f0ff' }}>Respects prefers-reduced-motion</span>
      </div>
    </div>
  );
};

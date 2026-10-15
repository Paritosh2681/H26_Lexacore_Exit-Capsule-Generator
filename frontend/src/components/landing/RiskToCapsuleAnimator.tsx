import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Cpu, 
  CheckCircle2, 
  FileCheck, 
  ArrowRight, 
  ShieldCheck, 
  Terminal,
  Play,
  Pause
} from 'lucide-react';

export const RiskToCapsuleAnimator: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps = [
    {
      id: 0,
      title: '1. Risk Discovery',
      badge: 'OBSERVED FACTS',
      badgeColor: '#C53030',
      badgeBg: '#FFF5F5',
      icon: AlertTriangle,
      description: 'AST analysis locates deprecated bindings and maintenance stagnation.',
      details: [
        { label: 'Target Dependency', value: 'requests==2.20.0 (Released 2018)' },
        { label: 'Observed AST Usages', value: '14 calls in src/telemetry/client.py' },
        { label: 'Identified Risk', value: 'CVE-2018-18074, blocking I/O in async loop' },
        { label: 'Risk Score', value: '68 / 100 (HIGH RISK)' }
      ]
    },
    {
      id: 1,
      title: '2. Gemma 4 Proposal',
      badge: 'AI HYPOTHESIS',
      badgeColor: '#B7791F',
      badgeBg: '#FFFAF0',
      icon: Cpu,
      description: 'Gemma 4 examines call expressions and proposes a drop-in replacement.',
      details: [
        { label: 'Candidate Package', value: 'httpx>=0.27.0' },
        { label: 'API Equivalence', value: 'requests.get() -> httpx.get()' },
        { label: 'Session Handling', value: 'requests.Session() -> httpx.Client()' },
        { label: 'Rationale', value: 'Active maintenance, HTTP/2, native async support' }
      ]
    },
    {
      id: 2,
      title: '3. Independent Verification',
      badge: 'EXECUTED CHECKS',
      badgeColor: '#2B6CB0',
      badgeBg: '#EBF8FF',
      icon: CheckCircle2,
      description: 'Independent sandbox engine verifies candidate package without trusting LLM.',
      details: [
        { label: 'PyPI Existence & Release', value: 'PASS — v0.27.0 active release' },
        { label: 'Clean Import Check', value: 'PASS — exit code 0' },
        { label: 'Isolated Test Suite', value: 'PASS — 8/8 test functions passed' },
        { label: 'API Drift Assessment', value: 'PASS — timeout parameter signature matches' }
      ]
    },
    {
      id: 3,
      title: '4. Exit Capsule Document',
      badge: 'AUDIT REPORT',
      badgeColor: '#276749',
      badgeBg: '#F0FFF4',
      icon: FileCheck,
      description: 'Generates immutable JSON and Markdown capsules with SHA-256 seal.',
      details: [
        { label: 'Integrity Seal', value: 'sha256:8f4c2e...b91a' },
        { label: 'Reviewer Gate', value: 'Approved by Senior Engineer' },
        { label: 'Coding Agent Prompt', value: 'Verified prompt ready for Cursor/Claude' },
        { label: 'Capsule Export', value: 'capsule.json + capsule.md generated' }
      ]
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-neutral)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 18px',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-neutral)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--accent-sage)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            End-to-End Resilience Pipeline
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-secondary"
            style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={isPlaying ? 'Pause auto-progression' : 'Play auto-progression'}
          >
            {isPlaying ? <Pause size={11} /> : <Play size={11} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid var(--border-neutral)',
        background: 'var(--bg-canvas)'
      }}>
        {steps.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveStep(idx);
              setIsPlaying(false);
            }}
            style={{
              padding: '12px 8px',
              border: 'none',
              borderBottom: activeStep === idx ? '2px solid var(--text-primary)' : '2px solid transparent',
              background: activeStep === idx ? 'var(--surface-primary)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              fontSize: '0.74rem',
              fontWeight: activeStep === idx ? 600 : 500,
              color: activeStep === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Stage Detail Card */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: current.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <StepIcon size={18} color={current.badgeColor} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {current.title}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {current.description}
              </p>
            </div>
          </div>

          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '4px',
            background: current.badgeBg,
            color: current.badgeColor
          }}>
            {current.badge}
          </span>
        </div>

        {/* Key Data Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          background: 'var(--bg-subtle)',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid var(--border-neutral)'
        }}>
          {current.details.map((d, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                {d.label}
              </div>
              <div style={{
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

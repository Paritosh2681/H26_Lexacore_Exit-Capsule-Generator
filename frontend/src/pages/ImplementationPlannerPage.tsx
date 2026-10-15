import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Play, 
  FileCode,
  Layers,
  AlertTriangle,
  RotateCcw,
  ListChecks,
  Code2,
  Terminal,
  BookOpen
} from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { getImplementationPlan } from '../api/client';

interface ImplementationPlannerPageProps {
  scanId: string;
  packageName: string;
  onBack: () => void;
  onNavigatePostVerify: () => void;
}

export const ImplementationPlannerPage: React.FC<ImplementationPlannerPageProps> = ({
  scanId,
  packageName,
  onBack,
  onNavigatePostVerify
}) => {
  const [planData, setPlanData] = useState<any>(null);
  const [planMarkdown, setPlanMarkdown] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modes & Tabs
  const [mode, setMode] = useState<'agent' | 'manual'>('agent');
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'prompt' | 'markdown'>('overview');
  
  // Interactive checklist tracking
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  useEffect(() => {
    setLoading(true);
    getImplementationPlan(scanId, packageName)
      .then((data) => {
        setPlanData(data.plan_data);
        setPlanMarkdown(data.plan_markdown);
        setAiPrompt(data.ai_agent_prompt);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [scanId, packageName]);

  const toggleCheck = (idx: number) => {
    setChecklistState((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  const handleCopyChecklist = () => {
    const lines = (planData?.verification_checklist || []).map((c: any, i: number) => 
      `[${checklistState[i] ? 'X' : ' '}] ${c.item} (${c.classification})`
    ).join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2200);
  };

  if (loading) {
    return <div style={{ maxWidth: '1000px', margin: '48px auto', textAlign: 'center', color: '#94a3b8' }}>Loading verified implementation plan...</div>;
  }

  if (error || !planData) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px' }} className="glass-panel">
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Plan Unavailable</h2>
        <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Return to Dependency</button>
      </div>
    );
  }

  const checklist = planData.verification_checklist || [];
  const completedChecksCount = Object.values(checklistState).filter(Boolean).length;
  const filesChanged = planData.files_likely_to_change || [];
  const orderedSteps = planData.ordered_implementation_steps || [];

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: '0.82rem' }}>
          <ArrowLeft size={15} /> Back to Details
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(12, 16, 24, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              onClick={() => { setMode('agent'); setActiveTab('prompt'); }}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: mode === 'agent' ? '#05070d' : '#94a3b8',
                background: mode === 'agent' ? '#00f0ff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} /> AI Agent Mode
            </button>
            <button
              onClick={() => { setMode('manual'); setActiveTab('checklist'); }}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: mode === 'manual' ? '#05070d' : '#94a3b8',
                background: mode === 'manual' ? '#00f0ff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ListChecks size={13} /> Manual Developer Mode
            </button>
          </div>

          <a
            href={`/api/scans/${scanId}/plan/${packageName}/download?format=md`}
            download={`plan_${packageName}.md`}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', textDecoration: 'none' }}
          >
            <Download size={14} /> Download MD
          </a>

          <button className="btn btn-cyan" onClick={onNavigatePostVerify} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            <Play size={14} fill="currentColor" /> Run Post-Verification <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Title & Document Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                DEVELOPER AUTHORIZED
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                Scan: {scanId}
              </span>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Migration Plan: {packageName} &rarr; {planData.candidate_package || 'replacement'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px', maxWidth: '720px' }}>
              {planData.objective || `Evidence-backed migration of ${packageName} to drop-in alternative ${planData.candidate_package}.`}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Checklist Completion</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00f0ff', marginTop: '2px' }}>
              {completedChecksCount} / {checklist.length}
            </div>
          </div>
        </div>

        {/* Tab Strip */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
          flexWrap: 'wrap'
        }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-cyan' : 'btn-ghost'}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <BookOpen size={14} /> Plan Overview
          </button>
          <button
            className={`btn ${activeTab === 'checklist' ? 'btn-cyan' : 'btn-ghost'}`}
            onClick={() => setActiveTab('checklist')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <ListChecks size={14} /> Interactive Checklist ({completedChecksCount}/{checklist.length})
          </button>
          <button
            className={`btn ${activeTab === 'prompt' ? 'btn-cyan' : 'btn-ghost'}`}
            onClick={() => setActiveTab('prompt')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Sparkles size={14} /> AI Agent Prompt
          </button>
          <button
            className={`btn ${activeTab === 'markdown' ? 'btn-cyan' : 'btn-ghost'}`}
            onClick={() => setActiveTab('markdown')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <FileText size={14} /> Markdown Spec
          </button>
        </div>
      </div>

      {/* TAB 1: PLAN OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Affected Files & Blast Radius */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="#00f0ff" /> AST-Identified Target Files ({filesChanged.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px' }}>
              Source files containing direct import statements or callable API sites mapped during AST static inspection.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filesChanged.map((f: string, i: number) => (
                <div key={i} style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: '#00f0ff' }}>{f}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>AST Verified</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Implementation Steps */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Ordered Implementation Tasks
            </h3>
            <ol style={{ paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
              {orderedSteps.map((s: string, i: number) => (
                <li key={i} style={{ marginBottom: '6px' }}>{s}</li>
              ))}
            </ol>
          </div>

          {/* Rollback Strategy */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fcd34d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="#f59e0b" /> Automated Rollback Strategy
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {planData.rollback_strategy || 'In the event of verification failure, execute `git restore .` to revert modified working copy source files and restore previous requirements pin.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CHECKLIST (MANUAL DEVELOPER MODE) */}
      {activeTab === 'checklist' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Verification & Execution Checklist
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                Follow steps sequentially and mark items as verified.
              </p>
            </div>
            <button
              onClick={handleCopyChecklist}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              {copiedChecklist ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedChecklist ? 'Checklist Copied' : 'Copy Checklist'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklist.map((c: any, i: number) => {
              const isChecked = !!checklistState[i];
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                    borderRadius: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div 
                    onClick={() => toggleCheck(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isChecked ? (
                      <CheckSquare size={18} color="#10b981" />
                    ) : (
                      <Square size={18} color="#64748b" />
                    )}
                    <span style={{
                      fontSize: '0.86rem',
                      color: isChecked ? '#e2e8f0' : '#cbd5e1',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      flex: 1,
                      fontWeight: isChecked ? 400 : 500
                    }}>
                      {c.item}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#00f0ff'
                    }}>
                      {c.classification}
                    </span>
                  </div>

                  {/* Optional Step Note Input */}
                  <div style={{ marginTop: '8px', paddingLeft: '30px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Add developer notes or test commands run for this step..."
                      value={stepNotes[i] || ''}
                      onChange={(e) => setStepNotes({ ...stepNotes, [i]: e.target.value })}
                      style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI CODING AGENT PROMPT */}
      {activeTab === 'prompt' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#8b5cf6" /> Ready-to-Copy AI Coding Agent Directive
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                Engineered for Cursor, Claude Code, GitHub Copilot, and Gemini CLI. Instructs the agent to make verified edits without hallucinations.
              </p>
            </div>

            <button className="btn btn-cyan" onClick={handleCopyPrompt} style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
              {copiedPrompt ? <Check size={15} /> : <Copy size={15} />}
              {copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}
            </button>
          </div>

          <CodeBlock code={aiPrompt} language="markdown" title="AI Coding Agent Directive" />
        </div>
      )}

      {/* TAB 4: MARKDOWN SPEC */}
      {activeTab === 'markdown' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            lineHeight: 1.65,
            color: '#e2e8f0'
          }}>
            {planMarkdown}
          </pre>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ExternalLink, ShieldCheck, Cpu, Play, CheckCircle2,
  XCircle, AlertTriangle, Code, FileText, ArrowRight, Ban, Clock, Sparkles
} from 'lucide-react';
import { getDependencyDetails, verifyDependency, recordApproval, createImplementationPlan } from '../api/client';
import { DependencyDetail, VerificationReport } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { RiskGauge } from '../components/RiskGauge';
import { CodeBlock } from '../components/CodeBlock';

interface DependencyDetailsPageProps {
  scanId: string;
  packageName: string;
  onBack: () => void;
  onOpenImplementationPlan: (pkgName: string) => void;
}

export const DependencyDetailsPage: React.FC<DependencyDetailsPageProps> = ({
  scanId,
  packageName,
  onBack,
  onOpenImplementationPlan
}) => {
  const [detail, setDetail] = useState<DependencyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification state
  const [candidatePackage, setCandidatePackage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [verError, setVerError] = useState<string | null>(null);

  // Approval state
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED' | 'PENDING'>('PENDING');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approving, setApproving] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getDependencyDetails(scanId, packageName);
      setDetail(data);
      if (data.ai_recommendation?.candidate_replacement) {
        setCandidatePackage(data.ai_recommendation.candidate_replacement);
      } else if (!candidatePackage) {
        setCandidatePackage(packageName);
      }
      if (data.approval) {
        setApprovalDecision(data.approval.decision);
        setApprovalNotes(data.approval.notes || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dependency details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [scanId, packageName]);

  const handleRunVerification = async () => {
    if (!candidatePackage.trim()) {
      setVerError('Please specify a candidate replacement package name.');
      return;
    }
    try {
      setVerifying(true);
      setVerError(null);
      const rep = await verifyDependency(scanId, packageName, candidatePackage.trim(), false);
      setVerificationReport(rep);
      fetchDetails();
    } catch (err: any) {
      setVerError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleApproval = async (decision: 'APPROVED' | 'REJECTED') => {
    try {
      setApproving(true);
      await recordApproval(scanId, packageName, decision, approvalNotes);
      setApprovalDecision(decision);
      fetchDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleGeneratePlan = async () => {
    const cand = candidatePackage || detail?.ai_recommendation?.candidate_replacement || packageName;
    try {
      await createImplementationPlan(scanId, packageName, cand);
      onOpenImplementationPlan(packageName);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ maxWidth: '1000px', margin: '48px auto', textAlign: 'center', color: '#94a3b8' }}>Loading dependency details...</div>;
  }

  if (error || !detail) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px' }} className="glass-panel">
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to Load Dependency</h2>
        <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Return to Results</button>
      </div>
    );
  }

  const meta = detail.pypi_metadata;
  const risk = detail.risk_breakdown;
  const checks = detail.verification_checks || [];
  const aiProposal = detail.ai_recommendation?.proposal;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Inventory
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge status={approvalDecision} type="approval" />
          {approvalDecision === 'APPROVED' && (
            <button className="btn btn-primary" onClick={handleGeneratePlan}>
              <FileText size={16} /> View Implementation Plan
            </button>
          )}
        </div>
      </div>

      {/* Package Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{detail.package_name}</h1>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                {detail.category}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px', maxWidth: '700px' }}>
              {meta?.summary || 'No package summary available on PyPI.'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Risk Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <RiskGauge score={detail.risk_score} level={risk?.level || 'LOW'} />
              <StatusBadge status={risk?.level || 'LOW'} type="risk" />
            </div>
          </div>
        </div>

        {/* Quick Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Pinned Version:</span>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
              {detail.declared_version || 'None (Unpinned)'}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Latest PyPI Version:</span>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
              {meta?.latest_version || 'Not found'}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Python Requirement:</span>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
              {meta?.requires_python || 'Unspecified'}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Yanked Status:</span>
            <span style={{ fontWeight: 600, color: meta?.is_yanked ? '#ef4444' : '#10b981' }}>
              {meta?.is_yanked ? `YANKED: ${meta.yanked_reason || 'Unspecified'}` : 'Clean (Not Yanked)'}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Evidence Breakdown */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#f59e0b" /> Deterministic Risk Evidence Breakdown
        </h2>

        {risk?.factors && risk.factors.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                <th style={{ padding: '8px 12px' }}>Factor</th>
                <th style={{ padding: '8px 12px' }}>Score Contribution</th>
                <th style={{ padding: '8px 12px' }}>Evidence / Rationale</th>
              </tr>
            </thead>
            <tbody>
              {risk.factors.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>{f.name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#f87171' }}>+{f.score}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                    {f.description}
                    {f.evidence && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#6366f1', marginTop: '2px' }}>
                        Ref: {f.evidence}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> No adverse risk flags detected for this dependency.
          </div>
        )}
      </div>

      {/* AST Code Usages Footprint */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="#38bdf8" /> AST Code Usage Footprint ({detail.ast_usages.length} sites)
          </h2>
        </div>

        {detail.ast_usages.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>
            Zero direct AST call expressions or import references found in repository source files.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {detail.ast_usages.map((u, i) => (
              <div key={i} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#a5b4fc', fontWeight: 600 }}>
                    {u.file_path}:{u.line_number}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    Scope: <span style={{ color: '#cbd5e1' }}>{u.enclosing_scope || 'module'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Expression: <code className="font-mono" style={{ color: '#38bdf8' }}>{u.call_expression || u.referenced_symbol || 'import'}</code>
                </div>

                {u.code_snippet && (
                  <CodeBlock code={u.code_snippet} language="python" title={`Source Context: ${u.file_path}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gemma 4 Migration Recommendation */}
      {aiProposal && (
        <div className="glass-panel" style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          background: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#c084fc" /> Gemma 4 Migration Proposal
            </h2>
            <span className="badge badge-medium">
              Difficulty: {aiProposal.estimated_migration_difficulty}
            </span>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#e2e8f0' }}>
            <strong>Proposed Replacement:</strong> <span className="font-mono" style={{ color: '#c084fc', fontWeight: 700 }}>{aiProposal.candidate_replacement}</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '16px' }}>
            {aiProposal.risk_summary}
          </p>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Reasons for Recommendation:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
              {aiProposal.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          {aiProposal.expected_api_differences && aiProposal.expected_api_differences.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Expected API Differences:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Original API</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Replacement API</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {aiProposal.expected_api_differences.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#f87171' }}>{d.original_api}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>{d.replacement_api}</td>
                      <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{d.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Independent Verification Runner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" /> Independent 10-Point Verification Engine
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
              Empirical checks run independently of the AI proposal to verify candidate availability and API compatibility.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Candidate package..."
              value={candidatePackage}
              onChange={(e) => setCandidatePackage(e.target.value)}
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.85rem' }}
            />
            <button
              className="btn btn-primary"
              onClick={handleRunVerification}
              disabled={verifying}
              style={{ fontSize: '0.85rem', padding: '7px 14px' }}
            >
              {verifying ? 'Verifying...' : 'Run Verification'}
            </button>
          </div>
        </div>

        {verError && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {verError}
          </div>
        )}

        {/* Checks Table */}
        {checks.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            Verification pipeline has not been executed yet for this package. Click "Run Verification" above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                <th style={{ padding: '8px 12px' }}>Check Step</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Evidence / Output</th>
                <th style={{ padding: '8px 12px' }}>Limitations</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.check_name}</td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={c.status} type="check" /></td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                    {c.evidence}
                    {c.error_details && (
                      <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>
                        Error: {c.error_details}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.75rem' }}>{c.limitations || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Developer Review and Approval Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>
          Developer Review & Approval Gate
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
          Explicitly approve or reject the proposed migration. Implementation plans and patch generations remain locked until developer authorization is recorded.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
            Review Notes & Migration Directives (Optional):
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="e.g., Verified API compatibility with team. Approved for httpx migration."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={() => handleApproval('APPROVED')}
              disabled={approving}
            >
              <CheckCircle2 size={16} /> Approve Migration
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleApproval('REJECTED')}
              disabled={approving}
            >
              <XCircle size={16} /> Reject Proposal
            </button>
          </div>

          {approvalDecision === 'APPROVED' && (
            <button className="btn btn-primary" onClick={handleGeneratePlan}>
              Proceed to Implementation Planner <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

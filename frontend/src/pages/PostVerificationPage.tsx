import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Clock,
  Terminal,
  FileCode2,
  GitCommit,
  Check,
  AlertCircle
} from 'lucide-react';
import { postVerifyWorkingCopy, getPostVerifications } from '../api/client';
import { PostVerificationRun } from '../api/types';
import { DiffViewer } from '../components/DiffViewer';
import { StatusBadge } from '../components/StatusBadge';

interface PostVerificationPageProps {
  scanId: string;
  onBack: () => void;
  onOpenCapsule: () => void;
}

export const PostVerificationPage: React.FC<PostVerificationPageProps> = ({
  scanId,
  onBack,
  onOpenCapsule
}) => {
  const [workingCopyPath, setWorkingCopyPath] = useState('');
  const [targetPackage, setTargetPackage] = useState('');
  const [candidatePackage, setCandidatePackage] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [latestRun, setLatestRun] = useState<PostVerificationRun | null>(null);
  const [history, setHistory] = useState<PostVerificationRun[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const runs = await getPostVerifications(scanId);
      setHistory(runs);
      if (runs.length > 0 && !latestRun) {
        setLatestRun(runs[0]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [scanId]);

  const handleRunPostVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workingCopyPath.trim() || !targetPackage.trim() || !candidatePackage.trim()) {
      setError('Please provide all required fields (working copy path, target, and candidate).');
      return;
    }

    try {
      setVerifying(true);
      setError(null);
      const res = await postVerifyWorkingCopy(
        scanId,
        workingCopyPath.trim(),
        targetPackage.trim(),
        candidatePackage.trim()
      );
      setLatestRun(res);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Post-verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const computeFinalState = (run: PostVerificationRun) => {
    const isPassed = run.status.toLowerCase() === 'passed';
    const failedChecks = (run.checks || []).filter(c => c.status === 'FAIL');
    const inconclusiveChecks = (run.checks || []).filter(c => c.status === 'INCONCLUSIVE');

    if (isPassed && failedChecks.length === 0) {
      return {
        label: 'VERIFIED AGAINST CONFIGURED CHECKS',
        color: 'var(--status-pass-text)',
        bg: 'var(--status-pass-bg)',
        border: 'var(--status-pass-border)',
        desc: 'All executed compatibility checks and test suites succeeded without regression.'
      };
    }
    if (failedChecks.length > 0) {
      return {
        label: 'VERIFICATION FAILED (REGRESSION DETECTED)',
        color: 'var(--status-fail-text)',
        bg: 'var(--status-fail-bg)',
        border: 'var(--status-fail-border)',
        desc: `${failedChecks.length} checks or test regression suites failed in the working copy.`
      };
    }
    if (inconclusiveChecks.length > 0) {
      return {
        label: 'PARTIALLY VERIFIED',
        color: 'var(--status-warn-text)',
        bg: 'var(--status-warn-bg)',
        border: 'var(--status-warn-border)',
        desc: 'Some verification checks passed, but certain test suites were inconclusive or incomplete.'
      };
    }
    return {
      label: 'VERIFICATION INCOMPLETE',
      color: 'var(--status-warn-text)',
      bg: 'var(--status-warn-bg)',
      border: 'var(--status-warn-border)',
      desc: 'Verification run completed with partial results.'
    };
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '18px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '6px 10px' }}>
            <ArrowLeft size={14} /> <span>Plans</span>
          </button>
          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display)',
              marginBottom: '2px'
            }}>
              Post-Implementation Verification
            </h1>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Scan: {scanId} | Compare working copy against verified baseline
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenCapsule}>
          <FileText size={14} /> <span>View Exit Capsule</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Verification Trigger Panel */}
        <div className="workbench-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Evaluate Working Copy
          </div>

          <form onSubmit={handleRunPostVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Working Copy Directory Path <span style={{ color: 'var(--status-fail-text)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="c:/projects/my-repo-modified"
                value={workingCopyPath}
                onChange={(e) => setWorkingCopyPath(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Target Package Replaced <span style={{ color: 'var(--status-fail-text)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="e.g. requests"
                value={targetPackage}
                onChange={(e) => setTargetPackage(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Candidate Package Installed <span style={{ color: 'var(--status-fail-text)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="e.g. httpx"
                value={candidatePackage}
                onChange={(e) => setCandidatePackage(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '8px 12px',
                background: 'var(--status-fail-bg)',
                border: '1px solid var(--status-fail-border)',
                borderRadius: '4px',
                color: 'var(--status-fail-text)',
                fontSize: '0.78rem'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={verifying} style={{ marginTop: '4px' }}>
              <Play size={13} />
              <span>{verifying ? 'Evaluating Checks...' : 'Execute Post-Verification'}</span>
            </button>
          </form>

          {/* Past Runs History */}
          {history.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Run History ({history.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {history.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setLatestRun(r)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: latestRun === r ? 'var(--bg-subtle)' : 'transparent',
                      border: '1px solid',
                      borderColor: latestRun === r ? 'var(--border-dark)' : 'var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span className="font-mono">
                      {r.working_copy_path.split(/[/\\]/).pop() || r.working_copy_path}
                    </span>
                    <StatusBadge status={r.status.toUpperCase()} type="check" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification Report Display */}
        {latestRun ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Explicit Final Status Banner */}
            {(() => {
              const state = computeFinalState(latestRun);
              return (
                <div style={{
                  padding: '16px 20px',
                  background: state.bg,
                  border: `1px solid ${state.border}`,
                  borderRadius: '5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {latestRun.status.toLowerCase() === 'passed' ? (
                      <CheckCircle2 size={18} color={state.color} />
                    ) : (
                      <AlertCircle size={18} color={state.color} />
                    )}
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: state.color, fontFamily: 'var(--font-mono)' }}>
                      {state.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: state.color, lineHeight: 1.5, margin: 0 }}>
                    {state.desc}
                  </p>
                </div>
              );
            })()}

            {/* Executed Verification Checks */}
            <div className="workbench-panel" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '12px 18px',
                background: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Verification Checks in Working Copy
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {latestRun.checks?.length || 0} checks recorded
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="workbench-table">
                  <thead>
                    <tr>
                      <th>Check Name</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(latestRun.checks || []).map((chk, i) => (
                      <tr key={i}>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 600 }}>{chk.name}</span>
                        </td>
                        <td>
                          <StatusBadge status={chk.status} type="check" />
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {chk.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Differences (Git Diff Viewer) */}
            <div className="workbench-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Resulting Code Changes (Working Copy Diff)
                </h2>
                <span className="badge badge-observed">Git Diff</span>
              </div>
              <DiffViewer diffText={latestRun.diff_summary || 'No file differences detected.'} />
            </div>
          </div>
        ) : (
          <div className="workbench-panel" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileCode2 size={36} color="var(--border-dark)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Post-Verification Run Selected
            </h3>
            <p style={{ fontSize: '0.82rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.55 }}>
              Specify the path to your working copy where migrations were applied to compare against baseline regression suites.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostVerificationPage;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
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
      setError(err.message || 'Post-implementation verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <button className="btn btn-primary" onClick={onOpenCapsule}>
          <FileText size={16} /> View Updated Capsule
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Post-Implementation Verification Suite
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
          Verify the developer's changes in a modified working copy or branch. Validates dependency declarations, AST imports, and executes tests in isolated copies without altering original code.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRunPostVerify}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Working Copy Directory Path
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. C:\projects\my-app-branch"
                value={workingCopyPath}
                onChange={(e) => setWorkingCopyPath(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Removed Target Package
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. requests"
                value={targetPackage}
                onChange={(e) => setTargetPackage(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Adopted Candidate Package
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. httpx"
                value={candidatePackage}
                onChange={(e) => setCandidatePackage(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={verifying}
              style={{ padding: '10px 20px' }}
            >
              <Play size={16} fill="currentColor" /> {verifying ? 'Verifying Working Copy...' : 'Run Post-Verification'}
            </button>
          </div>
        </form>
      </div>

      {/* Latest Run Results */}
      {latestRun && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#10b981" /> Post-Verification Outcome
              </h2>
              <StatusBadge status={latestRun.status} type="check" />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                  <th style={{ padding: '8px 12px' }}>Verification Check</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Details / Observation</th>
                </tr>
              </thead>
              <tbody>
                {latestRun.checks.map((chk, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f1f5f9' }}>{chk.name}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={chk.status} type="check" /></td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{chk.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
              Observed File Unified Diff:
            </h3>
            <DiffViewer diffText={latestRun.diff_summary} />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Layers, 
  AlertTriangle,
  Play,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { listImplementationPlans, listScans } from '../api/client';
import { ImplementationPlanSummary, ScanItem } from '../api/types';

interface PlansListPageProps {
  scanId: string | null;
  onSelectScan: (scanId: string) => void;
  onOpenPlan: (pkgName: string) => void;
  onNavigateNewScan: () => void;
}

export const PlansListPage: React.FC<PlansListPageProps> = ({
  scanId,
  onSelectScan,
  onOpenPlan,
  onNavigateNewScan
}) => {
  const [plans, setPlans] = useState<ImplementationPlanSummary[]>([]);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const scanList = await listScans();
      setScans(scanList);

      const targetId = scanId || scanList[0]?.scan_id;
      if (targetId) {
        if (!scanId) onSelectScan(targetId);
        const data = await listImplementationPlans(targetId);
        setPlans(data);
      } else {
        setPlans([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load implementation plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [scanId]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Header */}
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
        <div>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
            marginBottom: '2px'
          }}>
            Implementation Plans
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Engineering migration specifications with rollback strategies and acceptance criteria.
          </p>
        </div>

        {/* Scan Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scan:</span>
          <select
            value={scanId || ''}
            onChange={(e) => onSelectScan(e.target.value)}
            className="input-field font-mono"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}
          >
            {scans.map((s) => (
              <option key={s.scan_id} value={s.scan_id}>
                {s.repo_path.split(/[/\\]/).pop()} ({s.scan_id.slice(-6)})
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={fetchPlans} title="Refresh plans" style={{ padding: '6px' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="workbench-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Loading implementation plans...
        </div>
      ) : error ? (
        <div style={{
          padding: '12px 16px',
          background: 'var(--status-fail-bg)',
          border: '1px solid var(--status-fail-border)',
          borderRadius: '5px',
          color: 'var(--status-fail-text)',
          fontSize: '0.84rem'
        }}>
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="workbench-panel" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
          <FolderGit2 size={36} color="var(--border-dark)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Implementation Plans Generated Yet
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
            Implementation specifications are generated when you review and authorize migration proposals on a dependency detail page.
          </p>
          <button
            onClick={onNavigateNewScan}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            <span>Start Analysis or Review Scanned Dependencies</span>
          </button>
        </div>
      ) : (
        <div className="workbench-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="workbench-table">
              <thead>
                <tr>
                  <th>Target Package</th>
                  <th>Candidate Replacement</th>
                  <th>Checklist Items</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr 
                    key={p.package_name}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenPlan(p.package_name)}
                  >
                    <td>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.package_name}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 600, color: '#6D28D9' }}>
                        {p.candidate_package}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {p.steps_count || p.checks_count || 5}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '4px' }}>steps</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                          onClick={() => onOpenPlan(p.package_name)}
                        >
                          <span>Open Plan</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansListPage;

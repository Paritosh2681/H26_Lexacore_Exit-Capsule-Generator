import React, { useEffect, useState } from 'react';
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  FileCode,
  Sparkles,
  GitBranch,
  Terminal,
  Activity,
  FolderSearch
} from 'lucide-react';
import { listScans, deleteScan, listImplementationPlans } from '../api/client';
import { ScanItem } from '../api/types';

interface DashboardPageProps {
  onNavigateNewScan: () => void;
  onOpenScan: (scanId: string) => void;
  onOpenCapsule: (scanId: string) => void;
  onNavigateVerification?: (scanId: string) => void;
  onNavigatePlans?: (scanId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateNewScan,
  onOpenScan,
  onOpenCapsule,
  onNavigateVerification,
  onNavigatePlans
}) => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const data = await listScans();
      setScans(data);
      if (data.length > 0) {
        listImplementationPlans(data[0].scan_id)
          .then((p) => setPlansCount(p.length))
          .catch(() => {});
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete scan ${scanId} and its associated artifacts?`)) {
      try {
        await deleteScan(scanId);
        fetchScans();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const completedCount = scans.filter(s => s.status === 'completed').length;
  const totalDepsAssessed = scans.reduce((acc, s) => acc + (s.summary?.total_dependencies || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome & Overview Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(12, 16, 24, 0.95) 0%, rgba(19, 24, 36, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#00f0ff',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              OVERVIEW // REPOSITORY INTELLIGENCE
            </span>
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px', color: '#ffffff' }}>
            Python Dependency Resilience & Exit Capsule Platform
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Perform AST usage analysis, uncover maintenance rot, query Gemma 4 for migration candidates, and independently verify replacements in isolated virtual environments.
          </p>
        </div>

        <button
          className="btn btn-cyan"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          onClick={onNavigateNewScan}
        >
          <Play size={18} fill="currentColor" /> Start Repository Scan
        </button>
      </div>

      {/* Real Metric KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
            <Clock size={16} color="#00f0ff" /> Total Scanned Repos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '8px', color: '#ffffff' }}>
            {scans.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} color="#10b981" /> Completed Analyses
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '8px', color: '#34d399' }}>
            {completedCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
            <Layers size={16} color="#38bdf8" /> Dependencies Evaluated
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '8px', color: '#ffffff' }}>
            {totalDepsAssessed}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
            <FileCode size={16} color="#8b5cf6" /> Implementation Plans
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '8px', color: '#c4b5fd' }}>
            {plansCount}
          </div>
        </div>
      </div>

      {/* Recent Scans Table Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Repository Analyses History</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Historical scans recorded in local SQLite database.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchScans} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            Loading scans...
          </div>
        ) : error ? (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px' }}>
            {error}
          </div>
        ) : scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>No scans recorded yet</div>
            <p style={{ fontSize: '0.875rem', marginBottom: '16px', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              Scan a local Python repository to inspect dependencies, detect maintenance rot, and generate verified Exit Capsules.
            </p>
            <button className="btn btn-cyan" onClick={onNavigateNewScan}>
              <Play size={16} /> Scan a Repository Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '12px 16px' }}>Scan ID</th>
                  <th style={{ padding: '12px 16px' }}>Repository Path</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Dependencies</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.scan_id}
                    onClick={() => onOpenScan(scan.scan_id)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00f0ff' }}>
                      {scan.scan_id}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffffff' }}>
                      {scan.repo_path}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${scan.status === 'completed' ? 'badge-pass' : scan.status === 'failed' ? 'badge-fail' : 'badge-inconclusive'}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8' }}>
                      {scan.summary?.total_dependencies || 0} evaluated
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCapsule(scan.scan_id);
                          }}
                        >
                          <FileText size={13} /> Capsule
                        </button>
                        <button
                          className="btn btn-cyan"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenScan(scan.scan_id);
                          }}
                        >
                          Results <ArrowRight size={13} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 8px', fontSize: '0.78rem' }}
                          onClick={(e) => handleDelete(scan.scan_id, e)}
                          title="Delete Scan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

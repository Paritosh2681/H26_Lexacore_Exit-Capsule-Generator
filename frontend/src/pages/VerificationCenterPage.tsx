import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Filter, 
  Search, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Layers,
  FlaskConical,
  Play
} from 'lucide-react';
import { listVerificationChecks, listScans, verifyDependency } from '../api/client';
import { VerificationCheckRecord, ScanItem } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';

interface VerificationCenterPageProps {
  scanId: string | null;
  onSelectScan: (scanId: string) => void;
  onNavigateDependency: (pkgName: string) => void;
}

export const VerificationCenterPage: React.FC<VerificationCenterPageProps> = ({
  scanId,
  onSelectScan,
  onNavigateDependency
}) => {
  const [checks, setChecks] = useState<VerificationCheckRecord[]>([]);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Manual verify trigger modal/state
  const [targetPkg, setTargetPkg] = useState('');
  const [candPkg, setCandPkg] = useState('');
  const [runningVerify, setRunningVerify] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const scanList = await listScans();
      setScans(scanList);

      const targetScanId = scanId || scanList[0]?.scan_id;
      if (targetScanId) {
        if (!scanId) onSelectScan(targetScanId);
        const records = await listVerificationChecks(targetScanId);
        setChecks(records);
      } else {
        setChecks([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification checks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [scanId]);

  const handleManualRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId || !targetPkg.trim() || !candPkg.trim()) return;

    try {
      setRunningVerify(true);
      setVerifyMsg(null);
      await verifyDependency(scanId, targetPkg.trim(), candPkg.trim(), false);
      setVerifyMsg(`Evaluated ${targetPkg} -> ${candPkg}. Reloading verification records...`);
      setTimeout(() => setVerifyMsg(null), 3000);
      loadData();
    } catch (err: any) {
      setVerifyMsg(`Error: ${err.message}`);
    } finally {
      setRunningVerify(false);
    }
  };

  const filteredChecks = checks.filter((c) => {
    const matchesSearch = 
      c.check_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.package_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const passCount = checks.filter(c => c.status === 'PASS').length;
  const failCount = checks.filter(c => c.status === 'FAIL' || c.status === 'AI_CLAIM_REJECTED').length;
  const incCount = checks.filter(c => c.status === 'INCONCLUSIVE').length;

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
            Verification Suite
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Deterministic 10-point evaluation records and sandbox test results.
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
          <button className="btn btn-secondary" onClick={loadData} title="Refresh records" style={{ padding: '6px' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* KPI Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div className="workbench-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Total Checks Logged
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {checks.length}
          </div>
        </div>
        <div className="workbench-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--status-pass-text)', fontWeight: 600 }}>
            Passed Checks
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-pass-text)', fontFamily: 'var(--font-mono)' }}>
            {passCount}
          </div>
        </div>
        <div className="workbench-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--status-fail-text)', fontWeight: 600 }}>
            Failed / Rejected
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-fail-text)', fontFamily: 'var(--font-mono)' }}>
            {failCount}
          </div>
        </div>
        <div className="workbench-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--status-warn-text)', fontWeight: 600 }}>
            Inconclusive
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-warn-text)', fontFamily: 'var(--font-mono)' }}>
            {incCount}
          </div>
        </div>
      </div>

      {/* Manual Execution Banner */}
      <div className="workbench-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Execute Ad-Hoc Verification Check
        </div>
        <form onSubmit={handleManualRun} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="input-field font-mono"
            placeholder="Target package (e.g. requests)"
            style={{ width: '220px' }}
            value={targetPkg}
            onChange={(e) => setTargetPkg(e.target.value)}
            required
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&rarr;</span>
          <input
            type="text"
            className="input-field font-mono"
            placeholder="Candidate package (e.g. httpx)"
            style={{ width: '220px' }}
            value={candPkg}
            onChange={(e) => setCandPkg(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={runningVerify}>
            <Play size={12} />
            <span>{runningVerify ? 'Evaluating...' : 'Run 10-Point Suite'}</span>
          </button>
        </form>
        {verifyMsg && (
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-sage-dark)', marginTop: '8px' }}>
            {verifyMsg}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="workbench-panel" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} color="#8E9089" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search checks by name or package..."
            className="input-field"
            style={{ paddingLeft: '32px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="input-field"
            style={{ width: 'auto', padding: '6px 10px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Outcomes</option>
            <option value="PASS">Pass Only</option>
            <option value="FAIL">Fail Only</option>
            <option value="INCONCLUSIVE">Inconclusive Only</option>
            <option value="AI_CLAIM_REJECTED">Claim Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Checks Table */}
      <div className="workbench-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="workbench-table">
            <thead>
              <tr>
                <th style={{ width: '28px' }}></th>
                <th>Check Identifier</th>
                <th>Package Transition</th>
                <th>Outcome Status</th>
                <th>Execution Details</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((chk) => {
                const isExpanded = expandedId === chk.id;
                return (
                  <React.Fragment key={chk.id}>
                    <tr 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : chk.id)}
                    >
                      <td>
                        <button
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                          title="Toggle evidence output"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {chk.check_name}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: '0.78rem' }}>
                          {chk.package_name}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={chk.status} type="check" />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {chk.evidence ? chk.evidence.slice(0, 80) : 'Evaluated in isolated sandbox'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {new Date(chk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                            onClick={() => onNavigateDependency(chk.package_name)}
                          >
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Evidence Output */}
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-sidebar)' }}>
                        <td colSpan={7} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Evidence Payload (Sandbox Logs & Telemetry):
                          </div>
                          <div className="terminal-block" style={{ padding: '12px' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {chk.evidence || chk.error_details || 'Evaluated with zero errors.'}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No verification check records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenterPage;

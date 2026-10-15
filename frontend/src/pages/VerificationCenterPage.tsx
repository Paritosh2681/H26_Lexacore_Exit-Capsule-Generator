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
  ChevronUp,
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
      setError(err.message || 'Failed to fetch verification records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [scanId]);

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId || !targetPkg.trim() || !candPkg.trim()) return;
    try {
      setRunningVerify(true);
      setVerifyMsg(null);
      await verifyDependency(scanId, targetPkg.trim(), candPkg.trim(), true);
      setVerifyMsg(`Verification executed successfully for ${targetPkg}.`);
      setTargetPkg('');
      setCandPkg('');
      loadData();
    } catch (err: any) {
      setVerifyMsg(`Verification failed: ${err.message}`);
    } finally {
      setRunningVerify(false);
    }
  };

  const filtered = checks.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch = 
      c.check_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.evidence.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const passCount = checks.filter(c => c.status === 'PASS').length;
  const failCount = checks.filter(c => c.status === 'FAIL' || c.status === 'AI_CLAIM_REJECTED').length;
  const inconclCount = checks.filter(c => c.status === 'INCONCLUSIVE').length;
  const notRunCount = checks.filter(c => c.status === 'NOT_RUN' || c.status === 'UNVERIFIED').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Verification Center
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
            Independent, empirical check receipts executed inside ephemeral sandboxes. Differentiates verified facts from unverified AI claims.
          </p>
        </div>

        <button 
          onClick={loadData}
          className="btn btn-secondary" 
          style={{ fontSize: '0.82rem', padding: '7px 14px' }}
        >
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> PASS (DETERMINISTIC)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '6px', color: '#ffffff' }}>
            {passCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
            <XCircle size={16} /> FAILED / REJECTED
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '6px', color: '#ffffff' }}>
            {failCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
            <AlertTriangle size={16} /> INCONCLUSIVE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '6px', color: '#ffffff' }}>
            {inconclCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Clock size={16} /> UNVERIFIED / NOT RUN
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '6px', color: '#ffffff' }}>
            {notRunCount}
          </div>
        </div>
      </div>

      {/* Run New Verification Form Card */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical size={16} color="#00f0ff" /> Run Independent Sandbox Verification on Dependency
        </h3>

        <form onSubmit={handleRunVerification} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Target package (e.g. requests)"
            value={targetPkg}
            onChange={(e) => setTargetPkg(e.target.value)}
            style={{ width: '220px', fontSize: '0.82rem', padding: '8px 12px' }}
            required
          />
          <input
            type="text"
            className="input-field"
            placeholder="Candidate package (e.g. httpx)"
            value={candPkg}
            onChange={(e) => setCandPkg(e.target.value)}
            style={{ width: '220px', fontSize: '0.82rem', padding: '8px 12px' }}
            required
          />
          <button
            type="submit"
            className="btn btn-cyan"
            disabled={runningVerify || !scanId}
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
          >
            <Play size={14} /> {runningVerify ? 'Executing Sandbox...' : 'Run 10-Point Suite'}
          </button>
        </form>

        {verifyMsg && (
          <div style={{
            marginTop: '12px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            background: verifyMsg.includes('failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: verifyMsg.includes('failed') ? '#fca5a5' : '#6ee7b7'
          }}>
            {verifyMsg}
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search checks, packages, or evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Status Filter:</span>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Statuses ({checks.length})</option>
            <option value="PASS">PASS ({passCount})</option>
            <option value="FAIL">FAIL</option>
            <option value="INCONCLUSIVE">INCONCLUSIVE</option>
            <option value="AI_CLAIM_REJECTED">AI CLAIM REJECTED</option>
            <option value="NOT_RUN">NOT RUN</option>
          </select>
        </div>
      </div>

      {/* Checks Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Loading verification receipts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <AlertTriangle size={28} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>No verification records found</div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Run the verification engine above or select a package in Dependencies to execute live tests.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>Target Package</th>
                <th style={{ padding: '12px 16px' }}>Verification Check</th>
                <th style={{ padding: '12px 16px' }}>Outcome Status</th>
                <th style={{ padding: '12px 16px' }}>Observed Evidence</th>
                <th style={{ padding: '12px 16px' }}>Runtime</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((chk) => {
                const isExpanded = expandedId === chk.id;
                return (
                  <React.Fragment key={chk.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : chk.id)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00f0ff' }}>
                        {chk.package_name}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                        {chk.check_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={chk.status} type="check" />
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {chk.evidence}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#64748b' }}>
                        {chk.elapsed_seconds ? `${chk.elapsed_seconds.toFixed(2)}s` : '< 0.01s'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#94a3b8' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>

                    {/* Expandable Log & Command Inspector */}
                    {isExpanded && (
                      <tr style={{ background: '#05070a', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <td colSpan={6} style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                                Substantive Evidence Finding:
                              </span>
                              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.5 }}>
                                {chk.evidence}
                              </p>
                            </div>

                            {chk.command_executed && (
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                                  Executed Shell Command:
                                </span>
                                <pre style={{
                                  marginTop: '4px',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  color: '#00f0ff',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.78rem'
                                }}>
                                  {chk.command_executed}
                                </pre>
                              </div>
                            )}

                            {chk.error_details && (
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                                  Error / Limitation Log:
                                </span>
                                <pre style={{
                                  marginTop: '4px',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.05)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: '#fca5a5',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.78rem'
                                }}>
                                  {chk.error_details}
                                </pre>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                              <button
                                onClick={() => onNavigateDependency(chk.package_name)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                              >
                                View Dependency Analysis &rarr;
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

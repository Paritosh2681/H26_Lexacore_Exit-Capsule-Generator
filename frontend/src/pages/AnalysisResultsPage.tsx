import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Search, Filter, AlertTriangle, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { getScanDetails } from '../api/client';
import { ScanDetails, DependencyOverview } from '../api/types';
import { RiskGauge } from '../components/RiskGauge';
import { StatusBadge } from '../components/StatusBadge';

interface AnalysisResultsPageProps {
  scanId: string;
  onBack: () => void;
  onSelectDependency: (packageName: string) => void;
  onOpenCapsule: () => void;
}

export const AnalysisResultsPage: React.FC<AnalysisResultsPageProps> = ({
  scanId,
  onBack,
  onSelectDependency,
  onOpenCapsule
}) => {
  const [details, setDetails] = useState<ScanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    getScanDetails(scanId)
      .then(setDetails)
      .catch((err) => setError(err.message || 'Failed to fetch scan details'))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '48px auto', textAlign: 'center', color: '#94a3b8' }}>
        Loading scan analysis...
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px' }} className="glass-panel">
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Scan Failed to Load</h2>
        <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{error || 'Scan not found.'}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  const dependencies = details.dependencies || [];

  // Filter logic
  const filtered = dependencies.filter((dep) => {
    const matchesSearch = dep.package_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || dep.risk_breakdown?.level === filterRisk;
    const matchesCategory = filterCategory === 'ALL' || dep.category === filterCategory;
    return matchesSearch && matchesRisk && matchesCategory;
  });

  const criticalCount = dependencies.filter(d => d.risk_breakdown?.level === 'CRITICAL').length;
  const highCount = dependencies.filter(d => d.risk_breakdown?.level === 'HIGH').length;
  const undeclaredCount = dependencies.filter(d => d.category === 'candidate_undeclared').length;
  const unusedCount = dependencies.filter(d => d.category === 'candidate_unused').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Repository Dependency Inventory</h1>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Scan ID: {scanId} | {details.repo_path}
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenCapsule}>
          <FileText size={16} /> View Exit Capsule
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Evaluated</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>{dependencies.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#f87171' }}>Critical / High Risk</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', color: criticalCount + highCount > 0 ? '#ef4444' : '#10b981' }}>
            {criticalCount + highCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#fcd34d' }}>Undeclared Imports</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', color: '#fbbf24' }}>
            {undeclaredCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Unused Candidates</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>
            {unusedCount}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search package name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Risk Level:</span>
          <select
            className="input-field"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px' }}
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Category:</span>
          <select
            className="input-field"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="declared">Declared</option>
            <option value="candidate_undeclared">Candidate Undeclared</option>
            <option value="candidate_unused">Candidate Unused</option>
            <option value="dev">Dev / Test</option>
          </select>
        </div>
      </div>

      {/* Dependency Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 18px' }}>Package Name</th>
              <th style={{ padding: '14px 18px' }}>Category</th>
              <th style={{ padding: '14px 18px' }}>Version Spec</th>
              <th style={{ padding: '14px 18px' }}>Risk Score</th>
              <th style={{ padding: '14px 18px' }}>Level</th>
              <th style={{ padding: '14px 18px' }}>AST Call Sites</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  No dependencies match current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((dep) => (
                <tr
                  key={dep.package_name}
                  onClick={() => onSelectDependency(dep.package_name)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#f8fafc' }}>
                    {dep.package_name}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1'
                    }}>
                      {dep.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {dep.declared_version || 'unpinned'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <RiskGauge score={dep.risk_score} level={dep.risk_breakdown?.level || 'LOW'} />
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={dep.risk_breakdown?.level || 'LOW'} type="risk" />
                  </td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                    {dep.usages_count} call site(s)
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDependency(dep.package_name);
                      }}
                    >
                      Inspect & Plan <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

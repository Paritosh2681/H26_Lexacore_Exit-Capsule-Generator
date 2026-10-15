import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Calendar, 
  Layers, 
  AlertTriangle,
  Play
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
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileCode size={22} color="#00f0ff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Implementation Plans
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
            Developer-approved refactoring plans backed by AST call site mappings, sandbox verification receipts, and copyable coding-agent directives.
          </p>
        </div>

        <button 
          onClick={fetchPlans}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '7px 14px' }}
        >
          Refresh Plans
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
          Loading implementation plans...
        </div>
      ) : error ? (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: '8px' }}>
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
            No Implementation Plans Generated Yet
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Implementation plans are unlocked after a developer explicitly reviews and approves a candidate migration proposal under <strong>Dependencies</strong>.
          </p>
          <button
            onClick={() => {
              if (scans.length > 0) {
                window.location.hash = '#inventory';
              } else {
                onNavigateNewScan();
              }
            }}
            className="btn btn-cyan"
            style={{ fontSize: '0.85rem', padding: '8px 18px' }}
          >
            Review Dependencies & Approve Proposal &rarr;
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {plans.map((p) => (
            <div 
              key={p.package_name}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s, transform 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#f87171'
                    }}>
                      {p.package_name}
                    </span>
                    <span style={{ color: '#64748b' }}>&rarr;</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#34d399'
                    }}>
                      {p.candidate_package}
                    </span>
                  </div>

                  <span className="badge badge-pass" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    AUTHORIZED
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  {p.objective}
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '10px 0',
                  margin: '12px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>{p.files_count}</div>
                    <div>Files</div>
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>{p.steps_count}</div>
                    <div>Steps</div>
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>{p.checks_count}</div>
                    <div>Checks</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                <a
                  href={`/api/scans/${scanId}/plan/${p.package_name}/download?format=md`}
                  download={`plan_${p.package_name}.md`}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                  title="Download Markdown plan"
                >
                  <Download size={14} /> MD
                </a>

                <button
                  onClick={() => onOpenPlan(p.package_name)}
                  className="btn btn-cyan"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  Open Plan Workspace <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

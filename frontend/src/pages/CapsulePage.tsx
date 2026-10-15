import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Code, ShieldCheck, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { getCapsule } from '../api/client';
import { CapsuleResponse } from '../api/types';
import { CodeBlock } from '../components/CodeBlock';

interface CapsulePageProps {
  scanId: string;
  onBack: () => void;
}

export const CapsulePage: React.FC<CapsulePageProps> = ({ scanId, onBack }) => {
  const [capsule, setCapsule] = useState<CapsuleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'markdown' | 'json' | 'ledger'>('markdown');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCapsule(scanId)
      .then(setCapsule)
      .catch((err) => setError(err.message || 'Failed to load capsule'))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) {
    return <div style={{ maxWidth: '1000px', margin: '48px auto', textAlign: 'center', color: '#94a3b8' }}>Loading Exit Capsule...</div>;
  }

  if (error || !capsule) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px' }} className="glass-panel">
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to Load Capsule</h2>
        <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Return</button>
      </div>
    );
  }

  const data = capsule.capsule_data;
  const ledger = data?.evidence_ledger || [];

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(capsule.capsule_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Results
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleCopyMarkdown}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy MD'}
          </button>
          <a
            href={`/api/scans/${scanId}/capsule/download/md`}
            download="capsule.md"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={16} /> Download capsule.md
          </a>
          <a
            href={`/api/scans/${scanId}/capsule/download/json`}
            download="capsule.json"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={16} /> Download capsule.json
          </a>
        </div>
      </div>

      {/* Capsule Banner Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={28} color="#6366f1" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dependency Exit Capsule</h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              Scan ID: {scanId} | Tool Version: {data?.tool_version} | Schema: {data?.schema_version}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Migration Confidence</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8' }}>
              {data?.confidence_score}/100
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <button
            className={`btn ${activeTab === 'markdown' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('markdown')}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <FileText size={16} /> Human-Readable Markdown
          </button>
          <button
            className={`btn ${activeTab === 'ledger' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ledger')}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} /> Evidence Ledger ({ledger.length})
          </button>
          <button
            className={`btn ${activeTab === 'json' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('json')}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <Code size={16} /> Raw Validated JSON
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'markdown' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: '#e2e8f0'
          }}>
            {capsule.capsule_markdown}
          </pre>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>
            Substantive Evidence Ledger
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                <th style={{ padding: '10px 14px' }}>Claim / Finding</th>
                <th style={{ padding: '10px 14px' }}>Classification</th>
                <th style={{ padding: '10px 14px' }}>Evidence Basis</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 500, color: '#f1f5f9' }}>{item.claim}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: item.classification === 'verified' || item.classification === 'observed'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(99, 102, 241, 0.15)',
                      color: item.classification === 'verified' || item.classification === 'observed'
                        ? '#34d399'
                        : '#a5b4fc'
                    }}>
                      {item.classification}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{item.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'json' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <CodeBlock code={JSON.stringify(data, null, 2)} language="json" title="capsule.json" />
        </div>
      )}
    </div>
  );
};

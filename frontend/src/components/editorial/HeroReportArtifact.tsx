import React from 'react';
import { ShieldCheck, Check, ArrowRight, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const HeroReportArtifact: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      background: '#FFFFFF',
      border: '1px solid #E7E8E3',
      borderRadius: '8px',
      boxShadow: '0 4px 20px -2px rgba(17, 18, 16, 0.05)',
      overflow: 'hidden',
      textAlign: 'left'
    }}>
      {/* Restrained Horizontal Evidence Sequence Bar */}
      <div style={{
        padding: '12px 20px',
        background: '#F5F6F3',
        borderBottom: '1px solid #E7E8E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Sequence Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-interface)',
          color: '#696B66'
        }}>
          <span style={{ fontWeight: 600, color: '#111210' }}>01 Repository</span>
          <span style={{ color: '#95ABA7' }}>&rarr;</span>
          <span style={{ fontWeight: 600, color: '#111210' }}>02 Recommendation</span>
          <span style={{ color: '#95ABA7' }}>&rarr;</span>
          <span style={{ fontWeight: 600, color: '#111210' }}>03 Verification</span>
          <span style={{ color: '#95ABA7' }}>&rarr;</span>
          <span style={{ fontWeight: 600, color: '#111210' }}>04 Implementation Plan</span>
        </div>

        {/* Clear Specimen Label */}
        <span style={{
          fontSize: '0.68rem',
          fontFamily: 'var(--font-mono)',
          color: '#696B66',
          letterSpacing: '0.04em'
        }}>
          // SPECIMEN CAPSULE REPORT — ILLUSTRATIVE DATA
        </span>
      </div>

      {/* Main Technical Report Grid */}
      <div style={{ padding: '24px 28px' }}>
        {/* Artifact Header Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E7E8E3'
        }}>
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px'
            }}>
              Dependency Under Review
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#111210'
              }}>
                requests 2.22.0
              </span>
              <span style={{ color: '#95ABA7' }}>&rarr;</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#111210'
              }}>
                httpx &gt;= 0.27.0
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              marginBottom: '4px'
            }}>
              Verification Result
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-interface)',
              color: '#2E594F',
              background: '#EFF5F3',
              border: '1px solid #C8DDD7',
              padding: '3px 10px',
              borderRadius: '4px'
            }}>
              <Check size={14} strokeWidth={2.4} /> 10 / 10 CHECKS PASSED
            </span>
          </div>
        </div>

        {/* 4 Technical Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          padding: '20px 0',
          borderBottom: '1px solid #E7E8E3',
          fontSize: '0.84rem'
        }}>
          {/* Column 1: Risk Indicators */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              Risk Indicators
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: '#111210' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B85D5D' }} />
                <span>CVE-2023-32681 audit alert</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B85D5D' }} />
                <span>Upstream version lag (3.2 years)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#95ABA7' }} />
                <span>Python 3.12 compatibility warning</span>
              </li>
            </ul>
          </div>

          {/* Column 2: AST Source References */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              AST Source References
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <div style={{ color: '#111210' }}>src/telemetry/client.py:18</div>
              <div style={{ color: '#696B66' }}>&rarr; requests.get(url, timeout=...)</div>
              <div style={{ color: '#111210' }}>src/metrics/exporter.py:42</div>
              <div style={{ color: '#696B66' }}>&rarr; from requests.auth import BasicAuth</div>
            </div>
          </div>

          {/* Column 3: Sandbox Test Outcome */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              Deterministic Sandbox
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 600, color: '#111210', fontFamily: 'var(--font-mono)' }}>
                pytest exit_code: 0
              </div>
              <div style={{ fontSize: '0.78rem', color: '#696B66' }}>
                18 repository tests executed in isolated Python 3.11 virtualenv.
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2E594F', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                0 regressions detected
              </div>
            </div>
          </div>

          {/* Column 4: Open Concerns */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              Open Concerns
            </div>
            <div style={{ fontSize: '0.8rem', color: '#696B66', lineHeight: 1.5 }}>
              Synchronous streaming chunk-size semantics differ in edge cases. Flagged in Section 4 of implementation plan.
            </div>
          </div>
        </div>

        {/* Artifact Footer Metadata */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '16px',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          color: '#8C8E88'
        }}>
          <div>CAPSULE ID: e9b2f14a-7c2e-4b09</div>
          <div>DETERMINISTIC RECEIPT: sha256:d8c03fa91...</div>
          <div>EVIDENCE STATUS: VERIFIED</div>
        </div>
      </div>
    </div>
  );
};

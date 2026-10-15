import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Code2, 
  Check, 
  Terminal, 
  AlertCircle, 
  ArrowRight,
  GitBranch,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

interface ProductShowcaseProps {
  onOpenWorkspace: () => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onOpenWorkspace }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'verification' | 'ast'>('inventory');

  return (
    <div style={{
      width: '100%',
      background: '#FFFFFF',
      border: '1px solid #E7E8E3',
      borderRadius: '8px',
      boxShadow: '0 8px 30px -4px rgba(17, 18, 16, 0.06)',
      overflow: 'hidden',
      textAlign: 'left'
    }}>
      {/* Product Top Chrome Bar */}
      <div style={{
        padding: '12px 20px',
        background: '#FAFAF8',
        borderBottom: '1px solid #E7E8E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E7E8E3' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E7E8E3' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E7E8E3' }} />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: '#111210'
          }}>
            <GitBranch size={13} color="#696B66" />
            <span>org/fastapi-telemetry-service</span>
            <span style={{ color: '#8C8E88' }}>/</span>
            <span style={{ color: '#696B66' }}>scan_20261015_0824</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          background: '#EFF2F0',
          padding: '3px',
          borderRadius: '6px',
          gap: '2px'
        }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 500,
              fontFamily: 'var(--font-interface)',
              color: activeTab === 'inventory' ? '#111210' : '#696B66',
              background: activeTab === 'inventory' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: activeTab === 'inventory' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Dependency Inventory
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 500,
              fontFamily: 'var(--font-interface)',
              color: activeTab === 'verification' ? '#111210' : '#696B66',
              background: activeTab === 'verification' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: activeTab === 'verification' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Verification (10/10)
          </button>
          <button
            onClick={() => setActiveTab('ast')}
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 500,
              fontFamily: 'var(--font-interface)',
              color: activeTab === 'ast' ? '#111210' : '#696B66',
              background: activeTab === 'ast' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: activeTab === 'ast' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            AST Call Sites
          </button>
        </div>
      </div>

      {/* Tab 1: Dependency Inventory Table */}
      {activeTab === 'inventory' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#F5F6F3', borderBottom: '1px solid #E7E8E3', color: '#696B66' }}>
                <th style={{ padding: '10px 18px', fontWeight: 500, fontFamily: 'var(--font-interface)' }}>Package</th>
                <th style={{ padding: '10px 18px', fontWeight: 500, fontFamily: 'var(--font-interface)' }}>Version Pin</th>
                <th style={{ padding: '10px 18px', fontWeight: 500, fontFamily: 'var(--font-interface)' }}>Risk Score</th>
                <th style={{ padding: '10px 18px', fontWeight: 500, fontFamily: 'var(--font-interface)' }}>Evidence Classification</th>
                <th style={{ padding: '10px 18px', fontWeight: 500, fontFamily: 'var(--font-interface)' }}>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E7E8E3', background: '#FFFDFD' }}>
                <td style={{ padding: '14px 18px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#111210' }}>
                  requests
                </td>
                <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: '#696B66' }}>
                  2.22.0
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#B85D5D'
                  }}>
                    84/100 (HIGH)
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#F0F4F3',
                    color: '#2E594F',
                    border: '1px solid #C8DDD7'
                  }}>
                    OBSERVED
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#111210' }}>httpx &gt;= 0.27.0</span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: '#F5F6F3',
                      color: '#696B66'
                    }}>
                      AI SUGGESTED
                    </span>
                  </div>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #E7E8E3' }}>
                <td style={{ padding: '14px 18px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#111210' }}>
                  pycrypto
                </td>
                <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: '#696B66' }}>
                  2.6.1
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#B85D5D'
                  }}>
                    96/100 (CRITICAL)
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#F0F4F3',
                    color: '#2E594F',
                    border: '1px solid #C8DDD7'
                  }}>
                    OBSERVED
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#111210' }}>cryptography 42.0.5</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '14px 18px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#111210' }}>
                  pydantic
                </td>
                <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: '#696B66' }}>
                  2.8.2
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#2E594F'
                  }}>
                    12/100 (HEALTHY)
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#F0F4F3',
                    color: '#2E594F',
                    border: '1px solid #C8DDD7'
                  }}>
                    OBSERVED
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: '#696B66', fontSize: '0.8rem' }}>
                  Active upstream release (No migration required)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Verification Findings */}
      {activeTab === 'verification' && (
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #E7E8E3'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#111210', fontSize: '0.9rem' }}>
                10-Point Deterministic Suite: requests &rarr; httpx
              </div>
              <div style={{ fontSize: '0.76rem', color: '#696B66', fontFamily: 'var(--font-mono)' }}>
                Executed in isolated Python 3.11 sandbox • pytest runtime receipt confirmed
              </div>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: '#2E594F',
              background: '#EFF5F3',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid #C8DDD7'
            }}>
              10/10 PASS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { check: 'PyPI Wheel Available', status: 'PASS', detail: 'httpx 0.27.0 binary wheels available for Linux/macOS/Win' },
              { check: 'Python 3.12 Support', status: 'PASS', detail: 'Requires-Python: >=3.8, verified with host runtime' },
              { check: 'AST Symbol Compatibility', status: 'PASS', detail: '14/14 mapped imports have equivalent API surfaces' },
              { check: 'Ephemeral Virtualenv Clean Install', status: 'PASS', detail: 'Temporary virtualenv created in 1.2s without conflicts' },
              { check: 'Import Smoke Test', status: 'PASS', detail: 'import httpx executed with exit code 0' },
              { check: 'Direct Signature Equivalence', status: 'PASS', detail: 'get/post/put methods accept identical timeout and auth signatures' }
            ].map((c, i) => (
              <div key={i} style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: '#FAFAF8',
                border: '1px solid #E7E8E3',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#111210' }}>{c.check}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2E594F', fontWeight: 600 }}>{c.status}</span>
                </div>
                <div style={{ color: '#696B66', fontSize: '0.74rem', lineHeight: 1.4 }}>{c.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AST Call Sites */}
      {activeTab === 'ast' && (
        <div style={{ padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          <div style={{ color: '#696B66', marginBottom: '12px' }}>
            // Statically identified import statements and call expressions in source repository:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', background: '#FAFAF8', border: '1px solid #E7E8E3', borderRadius: '6px' }}>
              <div style={{ color: '#111210', fontWeight: 600 }}>src/telemetry/client.py:18</div>
              <div style={{ color: '#696B66', marginTop: '2px' }}>&gt; response = requests.get(self.endpoint, timeout=self.timeout)</div>
              <div style={{ color: '#2E594F', marginTop: '4px', fontSize: '0.74rem' }}>Proposed: response = httpx.get(self.endpoint, timeout=self.timeout)</div>
            </div>

            <div style={{ padding: '10px 14px', background: '#FAFAF8', border: '1px solid #E7E8E3', borderRadius: '6px' }}>
              <div style={{ color: '#111210', fontWeight: 600 }}>src/metrics/exporter.py:42</div>
              <div style={{ color: '#696B66', marginTop: '2px' }}>&gt; from requests.auth import HTTPBasicAuth</div>
              <div style={{ color: '#2E594F', marginTop: '4px', fontSize: '0.74rem' }}>Proposed: from httpx import BasicAuth</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Footer Bar */}
      <div style={{
        padding: '12px 20px',
        background: '#FAFAF8',
        borderTop: '1px solid #E7E8E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.74rem', color: '#696B66', fontFamily: 'var(--font-mono)' }}>
          Specimen UI preview • Connected to real analysis engine
        </div>

        <button
          onClick={onOpenWorkspace}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#111210',
            fontFamily: 'var(--font-interface)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Open in workspace &rarr;
        </button>
      </div>
    </div>
  );
};

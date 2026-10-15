import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight, Activity, GitBranch } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  version: string;
  x: number;
  y: number;
  riskScore: number;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'REPLACEMENT';
  astUsages: number;
  replacement?: string;
  description: string;
}

interface Edge {
  from: string;
  to: string;
  dashed?: boolean;
}

export const InteractiveDependencyGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('requests');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: Node[] = [
    {
      id: 'app',
      label: 'fastapi-service',
      version: '1.0.0',
      x: 80,
      y: 160,
      riskScore: 0,
      tier: 'LOW',
      astUsages: 0,
      description: 'Host repository application root'
    },
    {
      id: 'requests',
      label: 'requests',
      version: '2.20.0',
      x: 290,
      y: 90,
      riskScore: 68,
      tier: 'HIGH',
      astUsages: 14,
      replacement: 'httpx',
      description: 'Synchronous HTTP client. 14 blocking call sites in async event loop.'
    },
    {
      id: 'httpx',
      label: 'httpx (verified)',
      version: '0.27.0',
      x: 480,
      y: 90,
      riskScore: 8,
      tier: 'REPLACEMENT',
      astUsages: 0,
      description: 'Recommended async replacement. 10/10 automated verification checks passed.'
    },
    {
      id: 'pyyaml',
      label: 'pyyaml',
      version: '5.3.1',
      x: 290,
      y: 230,
      riskScore: 35,
      tier: 'MEDIUM',
      astUsages: 6,
      description: 'YAML parser. Uses deprecated yaml.load() without safe Loader parameter.'
    },
    {
      id: 'pydantic',
      label: 'pydantic',
      version: '2.6.4',
      x: 480,
      y: 230,
      riskScore: 5,
      tier: 'LOW',
      astUsages: 28,
      description: 'Data validation and schema library. Active, maintained, zero known CVEs.'
    }
  ];

  const edges: Edge[] = [
    { from: 'app', to: 'requests' },
    { from: 'app', to: 'pyyaml' },
    { from: 'requests', to: 'httpx', dashed: true },
    { from: 'pyyaml', to: 'pydantic' }
  ];

  const activeNode = nodes.find(n => n.id === (hoveredNode || selectedNode)) || nodes[1];

  const getNodeColor = (tier: Node['tier']) => {
    switch (tier) {
      case 'HIGH': return { fill: '#FFF5F5', stroke: '#E53E3E', text: '#C53030', badge: '#FED7D7' };
      case 'MEDIUM': return { fill: '#FFFAF0', stroke: '#DD6B20', text: '#C05621', badge: '#FEEBC8' };
      case 'REPLACEMENT': return { fill: '#F0FFF4', stroke: '#38A169', text: '#276749', badge: '#C6F6D5' };
      case 'LOW':
      default: return { fill: '#F7FAFC', stroke: '#718096', text: '#2D3748', badge: '#EDF2F7' };
    }
  };

  return (
    <div style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-neutral)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Chrome bar */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-neutral)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={15} color="var(--accent-sage)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Interactive AST Dependency Topology
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Click or hover nodes to inspect verified evidence
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(240px, 1fr)', gap: 0 }}>
        {/* SVG Graph Viewport */}
        <div style={{ padding: '24px', background: '#FAFAF8', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 580 320" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#A0AEC0" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#38A169" />
              </marker>
            </defs>

            {/* Render Edges */}
            {edges.map((e, idx) => {
              const src = nodes.find(n => n.id === e.from)!;
              const dst = nodes.find(n => n.id === e.to)!;
              const isMigration = e.dashed;
              return (
                <path
                  key={idx}
                  d={`M ${src.x} ${src.y} C ${(src.x + dst.x) / 2} ${src.y}, ${(src.x + dst.x) / 2} ${dst.y}, ${dst.x} ${dst.y}`}
                  fill="none"
                  stroke={isMigration ? '#38A169' : '#CBD5E0'}
                  strokeWidth={isMigration ? '2' : '1.5'}
                  strokeDasharray={isMigration ? '5,4' : 'none'}
                  markerEnd={isMigration ? 'url(#arrow-green)' : 'url(#arrow)'}
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map(n => {
              const colors = getNodeColor(n.tier);
              const isSelected = (hoveredNode || selectedNode) === n.id;
              return (
                <g 
                  key={n.id} 
                  transform={`translate(${n.x}, ${n.y})`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(n.id)}
                >
                  {/* Selection glow */}
                  {isSelected && (
                    <circle r="34" fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity="0.4" strokeDasharray="3,3" />
                  )}

                  {/* Node Circle */}
                  <circle
                    r="26"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />

                  {/* Node Text */}
                  <text
                    textAnchor="middle"
                    y="3"
                    fontFamily="var(--font-mono)"
                    fontSize="9.5px"
                    fontWeight="600"
                    fill={colors.text}
                  >
                    {n.label.split(' ')[0]}
                  </text>

                  {/* Version tag below */}
                  <text
                    textAnchor="middle"
                    y="38"
                    fontFamily="var(--font-mono)"
                    fontSize="8.5px"
                    fill="var(--text-secondary)"
                  >
                    {n.version}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Detail Inspector */}
        <div style={{
          padding: '20px',
          borderLeft: '1px solid var(--border-neutral)',
          background: 'var(--surface-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: '4px',
                background: getNodeColor(activeNode.tier).badge,
                color: getNodeColor(activeNode.tier).text,
                fontWeight: 600
              }}>
                {activeNode.tier === 'REPLACEMENT' ? 'PROPOSED REPLACEMENT' : `${activeNode.tier} RISK`}
              </span>
              <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                Score: {activeNode.riskScore}/100
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'var(--font-mono)' }}>
              {activeNode.label}
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Declared version: <code style={{ fontFamily: 'var(--font-mono)' }}>{activeNode.version}</code>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              {activeNode.description}
            </p>

            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-neutral)',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                AST Call Expressions Detected
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {activeNode.astUsages} references
              </div>
            </div>
          </div>

          {activeNode.replacement && (
            <div style={{
              padding: '10px 12px',
              background: '#F0FFF4',
              border: '1px solid #C6F6D5',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#276749', fontWeight: 600, textTransform: 'uppercase' }}>
                  Gemma 4 Recommendation
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#22543D', fontFamily: 'var(--font-mono)' }}>
                  Migrate to {activeNode.replacement}
                </div>
              </div>
              <ShieldCheck size={18} color="#276749" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

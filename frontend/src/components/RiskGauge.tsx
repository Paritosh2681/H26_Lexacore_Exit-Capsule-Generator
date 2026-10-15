import React from 'react';

interface RiskGaugeProps {
  score: number;
  level: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  let color = '#10b981'; // green
  if (score >= 70) color = '#ef4444'; // red
  else if (score >= 40) color = '#f97316'; // orange
  else if (score >= 20) color = '#f59e0b'; // amber

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '64px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, score))}%`,
          height: '100%',
          background: color,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color }}>
        {score}
      </span>
    </div>
  );
};

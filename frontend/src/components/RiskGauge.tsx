import React from 'react';

interface RiskGaugeProps {
  score: number;
  level: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  let color = '#166534'; // green
  let trackColor = '#E5E7E1';
  if (score >= 70) color = '#991B1B'; // red
  else if (score >= 40) color = '#C2410C'; // orange
  else if (score >= 20) color = '#854D0E'; // amber

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '56px',
        height: '4px',
        background: trackColor,
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, score))}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
          transition: 'width 0.2s ease'
        }} />
      </div>
      <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color, minWidth: '22px' }}>
        {score}
      </span>
    </div>
  );
};


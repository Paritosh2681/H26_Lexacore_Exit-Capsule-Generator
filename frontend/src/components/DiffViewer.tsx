import React from 'react';

interface DiffViewerProps {
  diffText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffText }) => {
  if (!diffText || !diffText.trim()) {
    return (
      <div style={{ padding: '16px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
        No file differences detected.
      </div>
    );
  }

  const lines = diffText.split('\n');

  return (
    <div style={{
      background: '#070b12',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',
      overflowX: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.825rem',
      lineHeight: 1.5,
      padding: '8px 0'
    }}>
      {lines.map((line, idx) => {
        let bg = 'transparent';
        let color = '#cbd5e1';

        if (line.startsWith('+') && !line.startsWith('+++')) {
          bg = 'rgba(16, 185, 129, 0.15)';
          color = '#6ee7b7';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          bg = 'rgba(239, 68, 68, 0.15)';
          color = '#fca5a5';
        } else if (line.startsWith('@@')) {
          bg = 'rgba(99, 102, 241, 0.15)';
          color = '#a5b4fc';
        }

        return (
          <div
            key={idx}
            style={{
              background: bg,
              color,
              padding: '1px 16px',
              whiteSpace: 'pre'
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

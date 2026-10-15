import React from 'react';

interface DiffViewerProps {
  diffText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffText }) => {
  if (!diffText || !diffText.trim()) {
    return (
      <div style={{ padding: '16px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
        No file differences detected.
      </div>
    );
  }

  const lines = diffText.split('\n');

  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--code-border)',
      borderRadius: '5px',
      overflowX: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
      lineHeight: 1.55,
      padding: '8px 0'
    }}>
      {lines.map((line, idx) => {
        let bg = 'transparent';
        let color = 'var(--code-text)';

        if (line.startsWith('+') && !line.startsWith('+++')) {
          bg = 'rgba(52, 211, 153, 0.12)';
          color = 'var(--code-green)';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          bg = 'rgba(248, 113, 113, 0.12)';
          color = 'var(--code-red)';
        } else if (line.startsWith('@@')) {
          bg = 'rgba(149, 171, 167, 0.12)';
          color = 'var(--code-amber)';
        }

        return (
          <div
            key={idx}
            style={{
              background: bg,
              color,
              padding: '2px 14px',
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


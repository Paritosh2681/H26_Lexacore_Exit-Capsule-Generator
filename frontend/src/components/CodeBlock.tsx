import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'python', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#070b12',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',
      overflow: 'hidden',
      margin: '8px 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.75rem',
        color: '#94a3b8'
      }}>
        <span>{title || language}</span>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '3px 8px', fontSize: '0.75rem', border: 'none', background: 'transparent' }}
          title="Copy code"
        >
          {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        padding: '12px',
        margin: 0,
        overflowX: 'auto',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-mono)',
        color: '#e2e8f0',
        lineHeight: 1.6
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

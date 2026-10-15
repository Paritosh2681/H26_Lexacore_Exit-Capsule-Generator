import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'python', 
  title,
  showLineNumbers = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeCode = typeof code === 'string' ? code : String(code || '');
  const lines = safeCode.split('\n');

  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--code-border)',
      borderRadius: '5px',
      overflow: 'hidden',
      margin: '8px 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: 'var(--code-surface)',
        borderBottom: '1px solid var(--code-border)',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--code-muted)'
      }}>
        <span>{title || language}</span>
        <button
          onClick={handleCopy}
          style={{ 
            padding: '2px 8px', 
            fontSize: '0.72rem', 
            border: 'none', 
            background: 'transparent',
            color: 'var(--code-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Copy code"
        >
          {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div style={{
        padding: '12px',
        margin: 0,
        overflowX: 'auto',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--code-text)',
        lineHeight: 1.6
      }}>
        {showLineNumbers ? (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td style={{
                    width: '32px',
                    color: 'var(--code-muted)',
                    textAlign: 'right',
                    paddingRight: '12px',
                    userSelect: 'none',
                    fontSize: '0.75rem',
                    borderRight: '1px solid var(--code-border)'
                  }}>
                    {idx + 1}
                  </td>
                  <td style={{ paddingLeft: '12px', whiteSpace: 'pre' }}>
                    {line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};


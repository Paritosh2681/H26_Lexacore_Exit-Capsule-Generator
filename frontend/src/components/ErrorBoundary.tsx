import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '720px',
          margin: '40px auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="var(--status-fail-text)" />
            <h2 style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {this.props.fallbackTitle || 'Component Rendering Error'}
            </h2>
          </div>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            lineHeight: 1.5
          }}>
            An unexpected error occurred while rendering this view. Your session and data are preserved.
          </p>
          {this.state.error && (
            <div style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--code-border)',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--status-fail-text)',
              marginBottom: '20px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              <span>Retry Component</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                window.location.search = '?tab=overview';
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={14} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

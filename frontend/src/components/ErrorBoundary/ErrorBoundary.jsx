import React from 'react';
import Button from '../Button/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0B0D17',
          color: '#F5F7FF',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '480px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#F87171' }}>Something went wrong</h2>
            <p style={{ color: '#A3AAC2', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              An unexpected error occurred while rendering this view.
            </p>
            <Button variant="primary" onClick={() => window.location.assign('/')}>
              Reload Application
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

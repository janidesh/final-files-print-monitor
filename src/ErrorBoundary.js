import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Caught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          color: '#fff', 
          background: '#111', 
          fontFamily: 'sans-serif', 
          textAlign: 'center',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ff4444' }}>Something went wrong</h1>
          <div style={{ 
            background: '#222', 
            padding: '20px', 
            borderRadius: '8px', 
            margin: '20px auto', 
            maxWidth: '800px',
            textAlign: 'left'
          }}>
            <pre style={{ color: '#ff8888', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
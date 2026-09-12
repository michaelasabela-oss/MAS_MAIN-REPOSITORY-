import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class SimulatorErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'Simulator error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('SimulatorErrorBoundary caught an error (e.g. WebGL unavailable):', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in IBADAN LIFE application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
          <div className="max-w-md bg-gray-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-bold text-emerald-400">IBADAN LIFE SIMULATOR</h1>
            <p className="text-sm text-gray-300">
              The application encountered a temporary display issue. Click below to reload the city environment.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-500 font-mono bg-gray-950 p-3 rounded-lg overflow-x-auto text-left">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg"
            >
              Reload Game Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

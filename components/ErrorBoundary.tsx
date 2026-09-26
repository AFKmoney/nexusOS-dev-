import React from 'react';
import { Terminal, AlertTriangle } from 'lucide-react';
import { eventBus } from '../kernel/eventBus';

type ErrorBoundaryProps = {
  appId: string;
  windowId: string;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.appId} crashed:`, error, errorInfo);
    eventBus.emit('daemon:urgent', `APP_CRASH: ${this.props.appId} crashed with error "${error.message}".`);
  }

  private retry = () => {
    const msg = this.state.error?.message || '';
    const chunkFail = /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(msg);
    if (chunkFail) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full bg-[#111] text-zinc-300 font-mono text-sm text-center">
          <AlertTriangle size={32} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">CRITICAL PROCESS FAILURE</h2>
          <p className="text-zinc-400 mb-4 max-w-sm">
            Process <span className="text-accent font-bold">{this.props.appId}</span> hit a runtime exception.
          </p>
          <div className="bg-black/50 p-4 rounded text-left w-full overflow-auto max-h-40 text-xs border border-red-500/20 text-red-400/80 font-mono break-words whitespace-pre-wrap">
             {this.state.error?.message || "Unknown error"}
          </div>
          <button
            type="button"
            onClick={this.retry}
            className="mt-6 px-4 py-2 rounded-lg border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/10"
          >
            Retry app
          </button>
          <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500 text-xs">
            <Terminal size={14} />
            <span>Hard refresh if this is a stale chunk (Ctrl+Shift+R)</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900 border border-red-900/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              The application encountered an unexpected error. Your annotation progress should be safe in local storage.
            </p>
            <div className="bg-black/50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
              <code className="text-[10px] text-red-400 font-mono break-all">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

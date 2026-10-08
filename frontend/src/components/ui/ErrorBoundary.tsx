import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in PlantAI:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white border-3 border-black rounded-2xl p-6 shadow-neo space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-2xl border-2 border-black shadow-neo-sm">
              !
            </div>
            <h1 className="text-xl font-black text-black">Error en PlantAI</h1>
            <p className="text-sm font-bold text-zinc-700">
              Ocurrió un problema al inicializar la pantalla:
            </p>
            <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-300 font-mono text-xs text-red-600 overflow-x-auto">
              {this.state.error?.message || 'Error desconocido'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#00C2CB] text-black font-black rounded-xl border-2 border-black shadow-neo hover:opacity-90"
            >
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

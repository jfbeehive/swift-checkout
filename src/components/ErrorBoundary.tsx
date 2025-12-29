import * as React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ensure we still see the real error in the console
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background text-foreground">
          <main className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="text-xl font-semibold">Algo deu errado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Um erro inesperado ocorreu na tela. Copie a mensagem abaixo e me envie para eu corrigir.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-card p-4 text-xs">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

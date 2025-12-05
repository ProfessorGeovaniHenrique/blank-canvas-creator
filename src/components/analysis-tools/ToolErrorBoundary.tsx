/**
 * 🛡️ TOOL ERROR BOUNDARY
 * 
 * Componente de error boundary para isolar falhas em ferramentas individuais
 * Previne que erros em uma ferramenta afetem toda a página
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  toolName: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.toolName}] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Erro em {this.props.toolName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro ao carregar esta ferramenta.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                {this.state.error.message}
              </pre>
            )}
            <Button size="sm" variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

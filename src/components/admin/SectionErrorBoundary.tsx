import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { captureExceptionWithContext } from '@/lib/sentry';

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Props {
  children: ReactNode;
  sectionName: string;
  sectionId?: string;
  severity?: Severity;
  fallbackHeight?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

const severityColors: Record<Severity, string> = {
  low: 'border-muted',
  medium: 'border-amber-500',
  high: 'border-orange-500',
  critical: 'border-destructive',
};

const severityBgColors: Record<Severity, string> = {
  low: 'bg-muted/20',
  medium: 'bg-amber-500/10',
  high: 'bg-orange-500/10',
  critical: 'bg-destructive/10',
};

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { sectionName, sectionId, severity = 'medium' } = this.props;
    
    // Log to Sentry with context
    captureExceptionWithContext(error, {
      feature: 'semantic-pipeline',
      action: `section-error-${sectionId || sectionName.toLowerCase().replace(/\s+/g, '-')}`,
      severity,
      extra: {
        sectionName,
        sectionId,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
      },
    });

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error(`[SectionErrorBoundary] Error in "${sectionName}":`, error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, showDetails: false });
    this.props.onRetry?.();
  };

  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    const { hasError, error, showDetails } = this.state;
    const { children, sectionName, severity = 'medium', fallbackHeight = 'min-h-[200px]' } = this.props;

    if (hasError) {
      return (
        <Card className={`${severityColors[severity]} border-2 ${severityBgColors[severity]} ${fallbackHeight}`}>
          <CardContent className="flex flex-col items-center justify-center h-full py-8 space-y-4">
            <AlertTriangle 
              className={`h-10 w-10 ${severity === 'critical' ? 'text-destructive' : 'text-amber-500'}`} 
              aria-hidden="true" 
            />
            
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-foreground">
                Erro em "{sectionName}"
              </h3>
              <p className="text-sm text-muted-foreground">
                Esta seção encontrou um problema e não pode ser exibida.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="gap-2"
                aria-label={`Tentar carregar ${sectionName} novamente`}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Tentar Novamente
              </Button>
            </div>

            {/* Dev-only error details */}
            {import.meta.env.DEV && error && (
              <div className="w-full max-w-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.toggleDetails}
                  className="w-full text-xs text-muted-foreground gap-1"
                  aria-expanded={showDetails}
                  aria-controls="error-details"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-3 w-3" aria-hidden="true" />
                      Ocultar Detalhes (Dev)
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                      Ver Detalhes (Dev)
                    </>
                  )}
                </Button>
                
                {showDetails && (
                  <div 
                    id="error-details"
                    className="mt-2 p-3 bg-muted/50 rounded-md text-xs font-mono overflow-auto max-h-32"
                  >
                    <p className="font-semibold text-destructive">{error.name}: {error.message}</p>
                    {error.stack && (
                      <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">
                        {error.stack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default SectionErrorBoundary;

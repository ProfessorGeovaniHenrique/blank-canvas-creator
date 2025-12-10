import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAnomalyAlerts, AnomalyAlert } from '@/hooks/useAnomalyAlerts';
import { 
  AlertTriangle, XCircle, Info, CheckCircle2, ChevronDown, 
  Clock, Eye, X, RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AlertItemProps {
  alert: AnomalyAlert;
  onAcknowledge: () => void;
  onResolve: (notes: string) => void;
  onDismiss: () => void;
}

function AlertItem({ alert, onAcknowledge, onResolve, onDismiss }: AlertItemProps) {
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = () => {
    switch (alert.severity) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'warning': return <Badge className="bg-amber-500 hover:bg-amber-600">Aviso</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const handleResolve = () => {
    onResolve(resolutionNotes);
    setResolveDialogOpen(false);
    setResolutionNotes('');
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        "border rounded-lg transition-colors",
        alert.severity === 'critical' && !alert.resolvedAt && "border-red-500/50 bg-red-500/5",
        alert.severity === 'warning' && !alert.resolvedAt && "border-amber-500/50 bg-amber-500/5",
        alert.resolvedAt && "opacity-60"
      )}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-3">
              {getSeverityIcon()}
              <div>
                <p className="font-medium">{alert.formattedMessage}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(alert.detectedAt, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getSeverityBadge()}
              {alert.acknowledgedAt && !alert.resolvedAt && (
                <Badge variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Visto
                </Badge>
              )}
              {alert.resolvedAt && (
                <Badge variant="outline" className="gap-1 text-green-500 border-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolvido
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-4">
            {/* Details */}
            <div className="grid gap-3 text-sm bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium capitalize">{alert.anomalyType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor esperado:</span>
                <span className="font-medium">{alert.expectedValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor atual:</span>
                <span className={cn(
                  "font-medium",
                  alert.actualValue > alert.expectedValue ? "text-red-500" : "text-amber-500"
                )}>
                  {alert.actualValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desvio (Z-score):</span>
                <span className="font-medium">{alert.deviationScore.toFixed(2)}σ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Detectado em:</span>
                <span className="font-medium">
                  {format(alert.detectedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Suggested Action */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Ação sugerida:</p>
              <p className="text-sm text-muted-foreground">{alert.suggestedAction}</p>
            </div>

            {/* Resolution Notes (if resolved) */}
            {alert.resolvedAt && alert.resolutionNotes && (
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium mb-1 text-green-700">Notas de resolução:</p>
                <p className="text-sm text-muted-foreground">{alert.resolutionNotes}</p>
              </div>
            )}

            {/* Actions */}
            {!alert.resolvedAt && (
              <div className="flex gap-2 justify-end">
                {!alert.acknowledgedAt && (
                  <Button variant="outline" size="sm" onClick={onAcknowledge}>
                    <Eye className="h-4 w-4 mr-2" />
                    Reconhecer
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  <X className="h-4 w-4 mr-2" />
                  Dispensar
                </Button>
                <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Resolver Alerta</DialogTitle>
                      <DialogDescription>
                        Adicione notas sobre como o problema foi resolvido.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Descreva a resolução..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={4}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleResolve}>
                        Confirmar Resolução
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function AnomalyAlertsPanel() {
  const { 
    activeAlerts, criticalCount, warningCount, isLoading, 
    acknowledgeAlert, resolveAlert, dismissAlert, refresh 
  } = useAnomalyAlerts();

  const [showResolved, setShowResolved] = useState(false);
  const { alerts } = useAnomalyAlerts();

  const displayedAlerts = showResolved ? alerts : activeAlerts;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Anomalias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Anomalias
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-2">{criticalCount} crítico{criticalCount > 1 ? 's' : ''}</Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-amber-500 hover:bg-amber-600 ml-1">{warningCount} aviso{warningCount > 1 ? 's' : ''}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Detecção automática de anomalias no pipeline
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
            >
              {showResolved ? 'Ocultar Resolvidos' : 'Mostrar Resolvidos'}
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-green-700">Sistema Saudável</p>
            <p className="text-sm text-muted-foreground">
              Nenhuma anomalia detectada no momento
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {displayedAlerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => acknowledgeAlert(alert.id)}
                  onResolve={(notes) => resolveAlert(alert.id, notes)}
                  onDismiss={() => dismissAlert(alert.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for header/sidebar
export function AnomalyAlertsBadge() {
  const { criticalCount, warningCount } = useAnomalyAlerts();
  
  const total = criticalCount + warningCount;
  if (total === 0) return null;

  return (
    <Badge 
      variant={criticalCount > 0 ? "destructive" : "secondary"}
      className={cn(
        "animate-pulse",
        criticalCount > 0 && "bg-red-500"
      )}
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      {total}
    </Badge>
  );
}

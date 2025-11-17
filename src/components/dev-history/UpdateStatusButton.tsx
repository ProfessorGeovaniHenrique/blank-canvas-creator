import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHistoryUpdate } from "@/hooks/useHistoryUpdate";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UpdateStatusButton() {
  const [open, setOpen] = useState(false);
  const { updateStatus, isUpdating, updateResult } = useHistoryUpdate();

  const handleUpdate = async () => {
    setOpen(true);
    await updateStatus();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleUpdate}
        disabled={isUpdating}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
        {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Status de Atualização do Projeto</DialogTitle>
            <DialogDescription>
              Análise das mudanças detectadas no projeto
            </DialogDescription>
          </DialogHeader>

          {updateResult && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Arquivos Totais</p>
                    <p className="text-2xl font-bold">{updateResult.totalFiles}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Linhas de Código</p>
                    <p className="text-2xl font-bold">{updateResult.totalLOC.toLocaleString()}</p>
                  </div>
                </div>

                {/* Changes Detected */}
                {updateResult.changes.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Mudanças Detectadas:</h4>
                    {updateResult.changes.map((change, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                        <Badge variant="outline" className="mt-0.5">
                          {change.type}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{change.description}</p>
                          {change.impact && (
                            <p className="text-xs text-muted-foreground mt-1">{change.impact}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma mudança detectada desde a última atualização
                  </div>
                )}

                {/* Phase Status */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Status das Fases:</h4>
                  <div className="space-y-2">
                    {updateResult.phaseStatus.map((phase, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm">{phase.name}</span>
                        <Badge
                          variant={
                            phase.status === 'completed' 
                              ? 'default' 
                              : phase.status === 'in-progress'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {phase.status === 'completed' ? 'Concluída' : 
                           phase.status === 'in-progress' ? 'Em Progresso' : 'Planejada'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-4">
                  Última atualização: {new Date(updateResult.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

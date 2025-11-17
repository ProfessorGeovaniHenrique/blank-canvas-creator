import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTagsets } from '@/hooks/useTagsets';
import { TagsetHierarchyTree } from './TagsetHierarchyTree';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function TagsetManager() {
  const { tagsets, stats, isLoading, approveTagsets, rejectTagsets, refetch } = useTagsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === tagsets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tagsets.map(t => t.id));
    }
  };

  const handleSelectPending = () => {
    const pendingIds = tagsets
      .filter(t => t.status !== 'ativo' && !t.aprovado_por)
      .map(t => t.id);
    setSelectedIds(pendingIds);
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Nenhum tagset selecionado');
      return;
    }

    setIsProcessing(true);
    try {
      await approveTagsets(selectedIds);
      setSelectedIds([]);
      toast.success(`${selectedIds.length} tagset(s) aprovados com sucesso`);
    } catch (err) {
      console.error('Erro ao aprovar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Nenhum tagset selecionado');
      return;
    }

    setIsProcessing(true);
    try {
      await rejectTagsets(selectedIds);
      setSelectedIds([]);
      toast.success(`${selectedIds.length} tagset(s) rejeitados`);
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveOne = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveTagsets([id]);
      toast.success('Tagset aprovado');
    } catch (err) {
      console.error('Erro ao aprovar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOne = async (id: string) => {
    setIsProcessing(true);
    try {
      await rejectTagsets([id]);
      toast.success('Tagset rejeitado');
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = tagsets.filter(t => t.status !== 'ativo' && !t.aprovado_por).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Taxonomia Semântica</CardTitle>
            <CardDescription>
              {stats.totalTagsets} categorias | {stats.activeTagsets} ativas | {stats.approvedTagsets} aprovadas
              {pendingCount > 0 && ` | ${pendingCount} pendentes`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de ações */}
        <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border">
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedIds.length === tagsets.length ? 'Desmarcar Todos' : 'Marcar Todos'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectPending}
              disabled={pendingCount === 0}
            >
              Marcar Pendentes ({pendingCount})
            </Button>
            {selectedIds.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selecionado(s)
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleApproveSelected}
              disabled={selectedIds.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aprovar Selecionados
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectSelected}
              disabled={selectedIds.length === 0 || isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar Selecionados
            </Button>
          </div>
        </div>

        {/* Árvore hierárquica */}
        {tagsets.length > 0 ? (
          <TagsetHierarchyTree
            tagsets={tagsets}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onApprove={handleApproveOne}
            onReject={handleRejectOne}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum tagset cadastrado ainda.</p>
            <p className="text-sm mt-2">
              Execute o script de seed para popular a taxonomia base.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

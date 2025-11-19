/**
 * Painel de gerenciamento de cache persistente
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HardDrive, Trash, X, AlertTriangle, Database, Zap, CloudOff } from 'lucide-react';
import { getCacheStats, invalidateCache, cleanExpiredCache } from '@/lib/corpusIndexedDBCache';
import { cacheMetrics } from '@/lib/cacheMetrics';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  totalSize: number;
  entries: number;
  compressionRatio: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export function CacheManagementPanel() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [quotaPercentage, setQuotaPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
      
      // Verificar quota
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const percentage = estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0;
        setQuotaPercentage(percentage);
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const handleCleanExpired = async () => {
    try {
      const removed = await cleanExpiredCache();
      toast({
        title: 'Cache limpo',
        description: `${removed} ${removed === 1 ? 'entrada expirada removida' : 'entradas expiradas removidas'}`,
      });
      loadStats();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao limpar cache expirado',
        variant: 'destructive'
      });
    }
  };
  
  const handleClearAll = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o cache? Isso irá recarregar os dados na próxima visualização.')) {
      return;
    }
    
    try {
      await invalidateCache();
      toast({
        title: 'Cache limpo',
        description: 'Todo o cache foi removido com sucesso',
      });
      loadStats();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao limpar cache',
        variant: 'destructive'
      });
    }
  };
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  const metrics = cacheMetrics.getMetrics();
  const hitRate = cacheMetrics.getCacheHitRate();
  
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="w-5 h-5 text-primary" />
          Cache Persistente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de quota baixa */}
        {quotaPercentage > 80 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Espaço de armazenamento baixo</AlertTitle>
            <AlertDescription>
              {quotaPercentage.toFixed(1)}% do espaço usado. Considere limpar caches antigos.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Estatísticas principais */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-2xl font-bold text-foreground">{stats.entries}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tamanho Total</p>
              <p className="text-2xl font-bold text-foreground">{formatBytes(stats.totalSize)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Compressão</p>
              <p className="text-2xl font-bold text-primary">
                {((1 - stats.compressionRatio) * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hitRate.toFixed(0)}%
              </p>
            </div>
          </div>
        )}
        
        {/* Métricas de performance */}
        <div className="border-t border-border/50 pt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Performance</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Hits:</span>
              <span className="ml-2 font-medium text-foreground">{metrics.operations.hits}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Misses:</span>
              <span className="ml-2 font-medium text-foreground">{metrics.operations.misses}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Load:</span>
              <span className="ml-2 font-medium text-foreground">
                {metrics.performance.avgLoadTime.toFixed(0)}ms
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Quota:</span>
              <span className="ml-2 font-medium text-foreground">
                {quotaPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicadores de fonte de cache */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="gap-1">
            <Zap className="w-3 h-3" />
            Memória
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Database className="w-3 h-3" />
            IndexedDB
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CloudOff className="w-3 h-3" />
            Rede
          </Badge>
        </div>
        
        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleCleanExpired} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <Trash className="w-4 h-4 mr-2" />
            Limpar Expirados
          </Button>
          <Button 
            onClick={handleClearAll} 
            variant="destructive" 
            size="sm"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

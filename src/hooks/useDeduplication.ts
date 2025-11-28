import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifications } from '@/lib/notifications';

export interface DeduplicationResult {
  dryRun: boolean;
  totalGroups?: number;
  processed: number;
  offset?: number;
  hasMore?: boolean;
  consolidated: number;
  duplicatesRemoved: number;
  releasesPreserved: number;
  topConsolidated: Array<{
    title: string;
    releasesCount: number;
    yearsSpan: string;
  }>;
}

export function useDeduplication() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<DeduplicationResult | null>(null);

  const analyze = async (corpusIds: string[] = []) => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('deduplicate-songs', {
        body: { dryRun: true, corpusIds }
      });

      if (error) throw error;

      setResult(data);
      notifications.success(
        'Análise concluída',
        `${data.duplicatesRemoved} duplicatas encontradas em ${data.processed} grupos`
      );

      return data;
    } catch (error: any) {
      console.error('Erro ao analisar duplicatas:', error);
      notifications.error(
        'Erro na análise',
        error.message || 'Não foi possível analisar duplicatas'
      );
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const execute = async (corpusIds: string[] = []) => {
    setIsExecuting(true);
    
    try {
      let offset = 0;
      let hasMore = true;
      let totalDuplicatesRemoved = 0;
      let totalReleasesPreserved = 0;
      let totalGroups = 0;
      let chunksProcessed = 0;

      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('deduplicate-songs', {
          body: { 
            dryRun: false, 
            corpusIds,
            chunkSize: 100,
            offset
          }
        });

        if (error) throw error;

        totalDuplicatesRemoved += data.duplicatesRemoved;
        totalReleasesPreserved += data.releasesPreserved;
        totalGroups = data.totalGroups || data.processed;
        hasMore = data.hasMore || false;
        offset += 100;
        chunksProcessed++;

        // Update progress
        const progress = Math.min(Math.round((offset / totalGroups) * 100), 100);
        notifications.info(
          `Processando... ${progress}%`,
          `Chunk ${chunksProcessed}: ${offset} de ${totalGroups} grupos processados`
        );
      }

      const finalResult = {
        dryRun: false,
        totalGroups,
        processed: totalGroups,
        consolidated: totalGroups,
        duplicatesRemoved: totalDuplicatesRemoved,
        releasesPreserved: totalReleasesPreserved,
        topConsolidated: []
      };

      setResult(finalResult);
      notifications.success(
        'Deduplicação concluída!',
        `${totalDuplicatesRemoved} duplicatas removidas, ${totalReleasesPreserved} releases preservados`
      );

      return finalResult;
    } catch (error: any) {
      console.error('Erro ao executar deduplicação:', error);
      notifications.error(
        'Erro na execução',
        error.message || 'Não foi possível executar deduplicação'
      );
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    analyze,
    execute,
    isAnalyzing,
    isExecuting,
    result,
    clearResult
  };
}

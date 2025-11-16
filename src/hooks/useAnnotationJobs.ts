import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnnotationJob {
  id: string;
  user_id: string;
  corpus_type: string;
  status: string;
  total_palavras: number | null;
  palavras_processadas: number | null;
  palavras_anotadas: number | null;
  progresso: number | null;
  tempo_inicio: string | null;
  tempo_fim: string | null;
  erro_mensagem: string | null;
  metadata: any;
}

export function useAnnotationJobs() {
  const [jobs, setJobs] = useState<AnnotationJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('annotation_jobs')
        .select('*')
        .order('tempo_inicio', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setJobs(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar jobs';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar jobs',
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Configurar realtime para atualizar jobs em tempo real
    const channel = supabase
      .channel('annotation_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'annotation_jobs'
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = {
    totalJobs: jobs.length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    inProgressJobs: jobs.filter(j => j.status === 'processing').length,
    totalWordsProcessed: jobs.reduce((sum, j) => sum + (j.palavras_processadas || 0), 0)
  };

  return {
    jobs,
    stats,
    isLoading,
    error,
    refetch: fetchJobs
  };
}

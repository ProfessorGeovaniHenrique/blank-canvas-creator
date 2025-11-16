import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LexiconEntry {
  id: string;
  palavra: string;
  lema: string | null;
  pos: string | null;
  tagset_codigo: string;
  prosody: number;
  confianca: number;
  validado: boolean;
  fonte: string | null;
  contexto_exemplo: string | null;
  criado_em: string;
  atualizado_em: string;
}

interface Filters {
  pos?: string;
  validationStatus?: 'all' | 'validated' | 'pending';
  searchTerm?: string;
}

export function useBackendLexicon(filters?: Filters) {
  const [lexicon, setLexicon] = useState<LexiconEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLexicon = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('semantic_lexicon')
        .select('*')
        .order('criado_em', { ascending: false });

      // Aplicar filtros
      if (filters?.pos && filters.pos !== 'all') {
        query = query.eq('pos', filters.pos);
      }

      if (filters?.validationStatus === 'validated') {
        query = query.eq('validado', true);
      } else if (filters?.validationStatus === 'pending') {
        query = query.eq('validado', false);
      }

      if (filters?.searchTerm) {
        query = query.ilike('palavra', `%${filters.searchTerm}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setLexicon(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar léxico';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar léxico',
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLexicon();
  }, [filters?.pos, filters?.validationStatus, filters?.searchTerm]);

  const stats = {
    totalWords: lexicon.length,
    validatedWords: lexicon.filter(w => w.validado).length,
    pendingWords: lexicon.filter(w => !w.validado).length,
    avgConfidence: lexicon.length > 0 
      ? lexicon.reduce((sum, w) => sum + w.confianca, 0) / lexicon.length 
      : 0
  };

  return {
    lexicon,
    stats,
    isLoading,
    error,
    refetch: fetchLexicon
  };
}

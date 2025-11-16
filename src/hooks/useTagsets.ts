import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Tagset {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria_pai: string | null;
  status: string;
  exemplos: string[] | null;
  validacoes_humanas: number;
  criado_por: string | null;
  criado_em: string;
  aprovado_por: string | null;
  aprovado_em: string | null;
}

export function useTagsets() {
  const [tagsets, setTagsets] = useState<Tagset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTagsets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('semantic_tagset')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) throw fetchError;

      setTagsets(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tagsets';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar tagsets',
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagsets();
  }, []);

  const proposeTagset = async (tagset: Omit<Tagset, 'id' | 'criado_em' | 'aprovado_por' | 'aprovado_em' | 'validacoes_humanas'>) => {
    try {
      const { error: insertError } = await supabase
        .from('semantic_tagset')
        .insert({
          codigo: tagset.codigo,
          nome: tagset.nome,
          descricao: tagset.descricao,
          categoria_pai: tagset.categoria_pai,
          status: tagset.status,
          exemplos: tagset.exemplos,
          criado_por: tagset.criado_por
        });

      if (insertError) throw insertError;

      toast({
        title: 'Tagset proposto com sucesso',
        description: `O tagset "${tagset.nome}" foi adicionado para revisão.`
      });

      await fetchTagsets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao propor tagset';
      toast({
        variant: 'destructive',
        title: 'Erro ao propor tagset',
        description: errorMessage
      });
      throw err;
    }
  };

  const stats = {
    totalTagsets: tagsets.length,
    activeTagsets: tagsets.filter(t => t.status === 'ativo').length,
    approvedTagsets: tagsets.filter(t => t.aprovado_por !== null).length
  };

  return {
    tagsets,
    stats,
    isLoading,
    error,
    refetch: fetchTagsets,
    proposeTagset
  };
}

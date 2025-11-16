import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DialectalEntry {
  id: string;
  verbete: string;
  verbete_normalizado: string;
  origem_regionalista: string[];
  origem_primaria: string;
  classe_gramatical: string | null;
  marcacao_temporal: string | null;
  frequencia_uso: string;
  definicoes: Array<{
    numero: number;
    texto: string;
    contexto: string | null;
    exemplos: string[];
    citacoesAutores: string[];
  }>;
  sinonimos: string[];
  remissoes: string[];
  variantes: string[];
  contextos_culturais: {
    costumes?: string[];
    crencas?: string[];
    divertimentos?: string[];
    fraseologias?: string[];
  };
  influencia_platina: boolean;
  termos_espanhol: string[];
  referencias_dicionarios: string[];
  categorias_tematicas: string[];
  volume_fonte: string | null;
  pagina_fonte: number | null;
  confianca_extracao: number;
  validado_humanamente: boolean;
  criado_em: string;
  atualizado_em: string;
}

interface DialectalFilters {
  origem?: string;
  categoria?: string;
  searchTerm?: string;
}

export function useDialectalLexicon(filters?: DialectalFilters) {
  const [entries, setEntries] = useState<DialectalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('dialectal_lexicon')
        .select('*')
        .order('verbete', { ascending: true });

      if (filters?.origem) {
        query = query.eq('origem_primaria', filters.origem);
      }

      if (filters?.categoria) {
        query = query.contains('categorias_tematicas', [filters.categoria]);
      }

      if (filters?.searchTerm) {
        query = query.ilike('verbete_normalizado', `%${filters.searchTerm.toLowerCase()}%`);
      }

      const { data, error: fetchError } = await query.limit(100);

      if (fetchError) throw fetchError;

      setEntries((data || []) as DialectalEntry[]);
    } catch (err) {
      console.error('Erro ao buscar léxico dialectal:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filters?.origem, filters?.categoria, filters?.searchTerm]);

  const stats = {
    total: entries.length,
    porOrigem: entries.reduce((acc, e) => {
      acc[e.origem_primaria] = (acc[e.origem_primaria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    comInfluenciaPlatina: entries.filter(e => e.influencia_platina).length,
    categorias: entries.reduce((acc, e) => {
      e.categorias_tematicas.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    entries,
    stats,
    isLoading,
    error,
    refetch: fetchEntries
  };
}

export function useDialectalEntry(palavra: string) {
  const [entry, setEntry] = useState<DialectalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!palavra) return;

      setIsLoading(true);
      setError(null);

      try {
        const normalizedWord = palavra.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const { data, error: fetchError } = await supabase
          .from('dialectal_lexicon')
          .select('*')
          .eq('verbete_normalizado', normalizedWord)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        setEntry(data as DialectalEntry | null);
      } catch (err) {
        console.error('Erro ao buscar verbete dialectal:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [palavra]);

  return { entry, isLoading, error };
}

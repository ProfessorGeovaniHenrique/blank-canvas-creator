import { useState, useEffect, useCallback } from 'react';
import { useFullTextCorpus } from './useFullTextCorpus';
import { CorpusType } from '@/data/types/corpus-tools.types';
import { SubcorpusMetadata, ComparativoSubcorpora } from '@/data/types/subcorpus.types';
import { extractSubcorpora, compareSubcorpora, getSubcorpusByArtista } from '@/utils/subcorpusAnalysis';

/**
 * Hook para gerenciar subcorpora (artistas)
 */
export function useSubcorpora(corpusType: CorpusType) {
  const { corpus, isLoading: isLoadingCorpus } = useFullTextCorpus(corpusType);
  const [subcorpora, setSubcorpora] = useState<SubcorpusMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extrair subcorpora quando corpus é carregado
  useEffect(() => {
    if (corpus && !isProcessing) {
      setIsProcessing(true);
      try {
        const extracted = extractSubcorpora(corpus);
        setSubcorpora(extracted);
        console.log(`✅ Subcorpora extraídos: ${extracted.length} artistas`);
      } catch (error) {
        console.error('Erro ao extrair subcorpora:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [corpus]);
  
  // Buscar subcorpus por artista
  const getByArtista = useCallback((artista: string) => {
    return getSubcorpusByArtista(subcorpora, artista);
  }, [subcorpora]);
  
  // Comparar dois artistas
  const compareArtists = useCallback((
    artistaA: string,
    artistaB?: string
  ): ComparativoSubcorpora | null => {
    if (!corpus) return null;
    
    try {
      return compareSubcorpora(corpus, artistaA, artistaB);
    } catch (error) {
      console.error('Erro ao comparar artistas:', error);
      return null;
    }
  }, [corpus]);
  
  return {
    subcorpora,
    isLoading: isLoadingCorpus || isProcessing,
    totalArtistas: subcorpora.length,
    getByArtista,
    compareArtists
  };
}

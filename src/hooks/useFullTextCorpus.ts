import { useState, useEffect } from "react";
import { CorpusCompleto } from "@/data/types/full-text-corpus.types";
import { CorpusType } from "@/data/types/corpus-tools.types";
import { useCorpusCache, CorpusFilters } from "@/contexts/CorpusContext";

/**
 * Hook to load and manage full-text corpus with persistent cache
 */
export function useFullTextCorpus(
  tipo: CorpusType,
  filters?: CorpusFilters
) {
  const { getFullTextCache } = useCorpusCache();
  const [corpus, setCorpus] = useState<CorpusCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheSource, setCacheSource] = useState<'memory' | 'indexeddb' | 'network' | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadCorpus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { corpus: loadedCorpus, source } = await getFullTextCache(tipo, filters);
        
        if (isMounted) {
          setCorpus(loadedCorpus);
          setCacheSource(source);
        }
      } catch (err) {
        console.error('Erro ao carregar corpus:', err);
        if (isMounted) {
          setError('Erro ao carregar corpus. Tente novamente.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadCorpus();
    
    return () => {
      isMounted = false;
    };
  }, [tipo, JSON.stringify(filters), getFullTextCache]);
  
  return { 
    corpus, 
    isLoading, 
    error,
    cacheSource,
    isReady: corpus !== null && !isLoading
  };
}

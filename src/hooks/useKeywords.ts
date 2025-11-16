import { useState, useEffect } from "react";
import { KeywordEntry } from "@/data/types/corpus-tools.types";
import { parseTSVCorpus } from "@/lib/corpusParser";
import { generateKeywords } from "@/services/keywordService";

export function useKeywords(
  corpusEstudo: 'canção' | 'gaúcho',
  corpusReferencia: 'nordestino' | 'gaúcho'
) {
  const [keywords, setKeywords] = useState<KeywordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadKeywords() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load reference corpus
        let referenciaData;
        if (corpusReferencia === 'nordestino') {
          const referenciaResponse = await fetch('/src/data/corpus/corpus-referencia-nordestino.txt');
          const referenciaText = await referenciaResponse.text();
          referenciaData = parseTSVCorpus(referenciaText);
        } else {
          const referenciaResponse = await fetch('/src/data/corpus/corpus-estudo-gaucho.txt');
          const referenciaText = await referenciaResponse.text();
          referenciaData = parseTSVCorpus(referenciaText);
        }
        
        // Load study corpus
        let estudoData;
        if (corpusEstudo === 'gaúcho') {
          const estudoResponse = await fetch('/src/data/corpus/corpus-estudo-gaucho.txt');
          const estudoText = await estudoResponse.text();
          estudoData = parseTSVCorpus(estudoText);
        } else {
          // TODO: Implement "canção" corpus when available
          setError('Corpus de canção individual ainda não implementado');
          setIsLoading(false);
          return;
        }
        
        // Generate keywords
        const kws = generateKeywords(estudoData, referenciaData);
        
        setKeywords(kws);
      } catch (err) {
        console.error('Error loading keywords:', err);
        setError('Erro ao carregar dados do corpus');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadKeywords();
  }, [corpusEstudo, corpusReferencia]);
  
  return { keywords, isLoading, error };
}

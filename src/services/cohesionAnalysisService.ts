/**
 * Cohesion Analysis Service
 * Based on Leech & Short Section 7.8 "Cohesion"
 */

import { CorpusCompleto } from '@/data/types/full-text-corpus.types';
import { CohesionProfile } from '@/data/types/stylistic-analysis.types';

type ConnectiveType = 'additive' | 'adversative' | 'causal' | 'temporal' | 'conclusive';

const CONNECTIVES: Record<ConnectiveType, string[]> = {
  additive: ['e', 'também', 'além', 'ainda', 'ademais', 'outrossim'],
  adversative: ['mas', 'porém', 'contudo', 'todavia', 'entretanto', 'no entanto'],
  causal: ['porque', 'pois', 'já que', 'visto que', 'uma vez que', 'dado que'],
  temporal: ['quando', 'enquanto', 'depois', 'antes', 'então', 'logo'],
  conclusive: ['portanto', 'assim', 'logo', 'então', 'por isso', 'consequentemente']
};

const PRONOUNS = [
  'ele', 'ela', 'eles', 'elas', 'o', 'a', 'os', 'as', 
  'lhe', 'lhes', 'seu', 'sua', 'seus', 'suas',
  'este', 'esta', 'esse', 'essa', 'aquele', 'aquela'
];

export function analyzeCohesion(corpus: CorpusCompleto): CohesionProfile {
  const connectives: Array<{ word: string; type: ConnectiveType; count: number }> = [];
  const connectiveMap = new Map<string, { type: ConnectiveType; count: number }>();
  
  let totalSentences = 0;
  const lexicalChains: Array<{ words: string[]; occurrences: number }> = [];

  corpus.musicas.forEach(musica => {
    const words = musica.palavras.map(w => w.toLowerCase());
    const text = musica.letra.toLowerCase();
    
    // Count sentences (approximate)
    totalSentences += (text.match(/[.!?]/g) || []).length;

    // Detect connectives
    Object.entries(CONNECTIVES).forEach(([type, wordList]) => {
      wordList.forEach(connective => {
        const regex = new RegExp(`\\b${connective}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const key = connective;
          const existing = connectiveMap.get(key);
          if (existing) {
            existing.count += matches.length;
          } else {
            connectiveMap.set(key, { type: type as ConnectiveType, count: matches.length });
          }
        }
      });
    });

    // Detect lexical chains (simplified - words appearing together frequently)
    const wordPairs = new Map<string, Set<string>>();
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      if (word1.length > 3 && word2.length > 3 && 
          !PRONOUNS.includes(word1) && !PRONOUNS.includes(word2)) {
        const key = [word1, word2].sort().join('-');
        if (!wordPairs.has(key)) {
          wordPairs.set(key, new Set());
        }
        wordPairs.get(key)!.add(`${word1} ${word2}`);
      }
    }

    // Convert frequent pairs to chains
    wordPairs.forEach((instances, key) => {
      if (instances.size >= 2) {
        lexicalChains.push({
          words: key.split('-'),
          occurrences: instances.size
        });
      }
    });
  });

  // Convert map to array
  connectiveMap.forEach((data, word) => {
    connectives.push({ word, type: data.type, count: data.count });
  });

  connectives.sort((a, b) => b.count - a.count);
  lexicalChains.sort((a, b) => b.occurrences - a.occurrences);

  const connectiveDensity = totalSentences > 0 
    ? connectives.reduce((acc, c) => acc + c.count, 0) / totalSentences 
    : 0;

  return {
    corpusType: corpus.tipo,
    connectives,
    connectiveDensity,
    connectiveVariation: connectives.length,
    anaphoricReferences: [], // Would require more sophisticated NLP
    lexicalChains: lexicalChains.slice(0, 20) // Top 20 chains
  };
}

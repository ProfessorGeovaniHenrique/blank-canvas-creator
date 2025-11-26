/**
 * Rhetorical Analysis Service
 * Detects rhetorical figures: repetition, alliteration, assonance, anaphora, parallelism
 * Based on Leech & Short's concept of "foregrounding" and "deviation"
 */

import { CorpusCompleto } from '@/data/types/full-text-corpus.types';
import { RhetoricalProfile, RhetoricalFigure } from '@/data/types/stylistic-analysis.types';

export function detectRhetoricalFigures(corpus: CorpusCompleto): RhetoricalProfile {
  const figures: RhetoricalFigure[] = [];
  
  corpus.musicas.forEach(musica => {
    const words = musica.palavras;
    const lines = musica.letra.split('\n').filter(line => line.trim().length > 0);
    
    // 1. Detect REPETITION (words appearing 3+ times in same song)
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      const lower = word.toLowerCase();
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    });
    
    Object.entries(wordFreq)
      .filter(([word, freq]) => freq >= 3 && word.length > 3)
      .forEach(([word, freq]) => {
      figures.push({
          type: 'repetition',
          example: word,
          context: `Repetida ${freq} vezes`,
          position: 0,
          metadata: {
            artista: musica.metadata.artista,
            musica: musica.metadata.musica
          }
        });
      });

    // 2. Detect ALLITERATION (3+ consecutive words starting with same consonant)
    for (let i = 0; i < words.length - 2; i++) {
      const consonant1 = words[i].charAt(0).toLowerCase();
      const consonant2 = words[i + 1].charAt(0).toLowerCase();
      const consonant3 = words[i + 2].charAt(0).toLowerCase();
      
      if (isConsonant(consonant1) && consonant1 === consonant2 && consonant2 === consonant3) {
        figures.push({
          type: 'alliteration',
          example: `${words[i]} ${words[i + 1]} ${words[i + 2]}`,
          context: musica.letra.substring(Math.max(0, i * 10), Math.min(musica.letra.length, i * 10 + 100)),
          position: i,
          metadata: {
            artista: musica.metadata.artista,
            musica: musica.metadata.musica
          }
        });
      }
    }

    // 3. Detect ASSONANCE (repeated vowel sounds in stressed syllables)
    // Simplified: look for words ending with same vowel pattern
    const vowelPatterns: Record<string, string[]> = {};
    words.forEach((word, idx) => {
      const pattern = word.toLowerCase().match(/[aeiou]{2,}$/)?.[0];
      if (pattern && pattern.length >= 2) {
        if (!vowelPatterns[pattern]) vowelPatterns[pattern] = [];
        vowelPatterns[pattern].push(word);
      }
    });
    
    Object.entries(vowelPatterns)
      .filter(([pattern, wordList]) => wordList.length >= 2)
      .forEach(([pattern, wordList]) => {
        figures.push({
          type: 'assonance',
          example: wordList.slice(0, 3).join(', '),
          context: `Padrão vocálico: ${pattern}`,
          position: 0,
          metadata: {
            artista: musica.metadata.artista,
            musica: musica.metadata.musica
          }
        });
      });

    // 4. Detect ANAPHORA (repeated words at start of lines)
    const lineStarts: Record<string, number> = {};
    lines.forEach(line => {
      const firstWord = line.trim().split(' ')[0]?.toLowerCase();
      if (firstWord && firstWord.length > 2) {
        lineStarts[firstWord] = (lineStarts[firstWord] || 0) + 1;
      }
    });
    
    Object.entries(lineStarts)
      .filter(([word, count]) => count >= 2)
      .forEach(([word, count]) => {
        figures.push({
          type: 'anaphora',
          example: word,
          context: `Repetida no início de ${count} versos`,
          position: 0,
          metadata: {
            artista: musica.metadata.artista,
            musica: musica.metadata.musica
          }
        });
      });

    // 5. Detect PARALLELISM (lines with similar length and structure)
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i].trim();
      const line2 = lines[i + 1].trim();
      
      const words1 = line1.split(' ');
      const words2 = line2.split(' ');
      
      // Similar length (within 20%)
      if (Math.abs(words1.length - words2.length) <= Math.max(2, words1.length * 0.2)) {
        // Similar structure (first and last words match pattern)
        if (words1[0]?.length === words2[0]?.length && 
            words1[words1.length - 1]?.length === words2[words2.length - 1]?.length) {
          figures.push({
            type: 'parallelism',
            example: `${line1.substring(0, 50)}... / ${line2.substring(0, 50)}...`,
            context: "Estruturas paralelas",
            position: i,
            metadata: {
              artista: musica.metadata.artista,
              musica: musica.metadata.musica
            }
          });
        }
      }
    }
  });

  // Calculate statistics
  const figuresByType: Record<string, number> = {};
  figures.forEach(fig => {
    figuresByType[fig.type] = (figuresByType[fig.type] || 0) + 1;
  });

  const totalWords = corpus.musicas.reduce((acc, m) => acc + m.palavras.length, 0);
  const figureDensity = (figures.length / totalWords) * 100;

  return {
    corpusType: corpus.tipo,
    totalFigures: figures.length,
    figureDensity,
    figuresByType,
    figures
  };
}

function isConsonant(char: string): boolean {
  return /[bcdfghjklmnpqrstvwxyz]/.test(char.toLowerCase());
}

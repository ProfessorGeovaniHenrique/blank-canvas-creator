/**
 * Processa letra de música para formato corpus CSV
 */

export interface WordStats {
  freq: number;
  stanzas: Set<number>;
}

/**
 * Processa letra de música para formato corpus CSV
 * @param lyrics - Texto da letra
 * @param stanzaSeparator - Separador de estrofes (default: linha vazia)
 * @returns CSV string no formato headword,freq,range
 */
export function processLyricsToCorpus(
  lyrics: string,
  stanzaSeparator: string = '\n\n'
): string {
  // 1. Dividir em estrofes
  const stanzas = lyrics.split(stanzaSeparator).filter(s => s.trim());

  // 2. Tokenizar e normalizar
  const wordMap = new Map<string, WordStats>();

  stanzas.forEach((stanza, stanzaIndex) => {
    const words = stanza
      .toLowerCase()
      .replace(/[^\wáàâãéêíóôõúç\s]/g, ' ') // Remove pontuação
      .split(/\s+/)
      .filter(w => w.length > 0);

    words.forEach(word => {
      if (!wordMap.has(word)) {
        wordMap.set(word, { freq: 0, stanzas: new Set() });
      }
      const entry = wordMap.get(word)!;
      entry.freq++;
      entry.stanzas.add(stanzaIndex);
    });
  });

  // 3. Gerar CSV
  const csvLines = ['headword,freq,range'];

  // Ordenar por frequência decrescente
  const sortedEntries = Array.from(wordMap.entries())
    .sort((a, b) => b[1].freq - a[1].freq);

  sortedEntries.forEach(([word, data]) => {
    csvLines.push(`${word},${data.freq},${data.stanzas.size}`);
  });

  return csvLines.join('\n');
}

/**
 * Calcula estatísticas básicas de um corpus
 */
export function calculateCorpusStats(lyrics: string): {
  totalTokens: number;
  uniqueWords: number;
  averageWordLength: number;
} {
  const words = lyrics
    .toLowerCase()
    .replace(/[^\wáàâãéêíóôõúç\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  const uniqueWords = new Set(words);
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);

  return {
    totalTokens: words.length,
    uniqueWords: uniqueWords.size,
    averageWordLength: totalLength / words.length,
  };
}

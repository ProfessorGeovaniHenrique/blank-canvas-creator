/**
 * Pré-processador de texto para dicionários dialectais
 * Remove formatação de PDF e prepara texto para parsing de verbetes
 */

export function preprocessDialectalText(rawContent: string, volumeNum: 'I' | 'II'): string {
  let processed = rawContent;
  
  // 1. Remover separadores de página
  processed = processed.replace(/={10,}\s*PÁGINA\s+\d+\s+de\s+\d+\s*={10,}/gi, '\n');
  
  // 2. Remover linhas vazias excessivas (mais de 2 quebras seguidas)
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  // 3. Remover hífens de quebra de linha (palavra quebrada entre linhas)
  processed = processed.replace(/([a-záàãâéêíóôõúç])-\s*\n\s*([a-záàãâéêíóôõúç])/gi, '$1$2');
  
  // 4. Para Volume I: pular páginas introdutórias (até primeira ocorrência de verbete)
  if (volumeNum === 'I') {
    // Encontrar primeiro verbete (palavra em MAIÚSCULAS seguida de origem)
    const firstVerbeteMatch = processed.search(/\n[A-ZÁÀÃÉÊÍÓÔÚÇ\-]+\s+\((BRAS|PLAT|CAST|QUER|BRAS\/PLAT)\)/);
    if (firstVerbeteMatch !== -1) {
      processed = processed.substring(firstVerbeteMatch);
    }
  }
  
  // 5. Para Volume II: começar do primeiro verbete (GABARDO)
  if (volumeNum === 'II') {
    const firstVerbeteMatch = processed.search(/\nGABARDO\s+\((BRAS|PLAT)\)/);
    if (firstVerbeteMatch !== -1) {
      processed = processed.substring(firstVerbeteMatch);
    }
  }
  
  // 6. Normalizar espaços múltiplos (exceto no início de linha)
  processed = processed.replace(/([^\n])\s{2,}/g, '$1 ');
  
  // 7. Garantir que cada verbete comece em nova linha
  // Inserir quebra antes de palavra em MAIÚSCULAS seguida de origem
  processed = processed.replace(/([^\n])([A-ZÁÀÃÉÊÍÓÔÚÇ\-]{3,}\s+\((BRAS|PLAT|CAST|QUER|BRAS\/PLAT)\))/g, '$1\n\n$2');
  
  // 8. Remover espaços no início e fim
  processed = processed.trim();
  
  return processed;
}

/**
 * Extrai estatísticas do texto pré-processado para validação
 */
export function getPreprocessingStats(processedText: string) {
  const lines = processedText.split('\n');
  
  // Contar verbetes (linhas que começam com MAIÚSCULAS + origem)
  const verbetePattern = /^[A-ZÁÀÃÉÊÍÓÔÚÇ\-]{3,}\s+\((BRAS|PLAT|CAST|QUER|BRAS\/PLAT)\)/;
  const verbetesCount = lines.filter(line => verbetePattern.test(line.trim())).length;
  
  // Identificar primeiros 5 verbetes
  const firstVerbetes = lines
    .filter(line => verbetePattern.test(line.trim()))
    .slice(0, 5)
    .map(line => {
      const match = line.match(/^([A-ZÁÀÃÉÊÍÓÔÚÇ\-]+)/);
      return match ? match[1] : '';
    });
  
  return {
    totalLines: lines.length,
    totalChars: processedText.length,
    estimatedVerbetes: verbetesCount,
    firstVerbetes,
    sample: processedText.substring(0, 500)
  };
}

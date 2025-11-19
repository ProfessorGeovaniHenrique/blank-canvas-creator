/**
 * Utilitário de sanitização para prevenir erros de encoding no Postgres
 * Remove caracteres nulos (0x00) e caracteres de controle inválidos
 * 
 * Versão 2: Adiciona sanitizeObject para sanitização recursiva de objetos complexos
 */

/**
 * Sanitiza string removendo caracteres problemáticos
 * @param input String de entrada (pode ser null/undefined)
 * @param maxLength Tamanho máximo permitido (padrão: 2MB)
 * @returns String sanitizada ou vazia se input for nulo
 */
export function sanitizeText(input?: string | null, maxLength = 2_000_000): string {
  if (!input) return '';
  
  // Remove null bytes (\u0000) que causam erro no Postgres
  // Remove caracteres de controle (0x00-0x1F exceto newline/tab)
  let sanitized = input
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ') // Remove control chars (keep \n \t)
    .trim();
  
  // Limitar tamanho máximo
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitiza array de strings
 * Remove entradas vazias após sanitização
 */
export function sanitizeArray(arr: string[]): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  
  return arr
    .map(s => sanitizeText(s))
    .filter(s => s.length > 0);
}

/**
 * Sanitiza objeto recursivamente
 * Aplica sanitização em todas as strings, arrays e objetos aninhados
 * 
 * @param obj Objeto a ser sanitizado
 * @param maxLength Tamanho máximo para strings (padrão: 2MB)
 * @returns Objeto com todos os campos string sanitizados
 * 
 * @example
 * const dirty = {
 *   name: "Test\u0000Name",
 *   nested: {
 *     description: "Has\u0000nulls",
 *     tags: ["tag\u00001", "tag2"]
 *   }
 * };
 * const clean = sanitizeObject(dirty);
 * // Retorna objeto sem \u0000 em nenhum campo
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, maxLength = 2_000_000): T {
  if (obj == null) return obj;
  
  const out: any = Array.isArray(obj) ? [] : {};
  
  for (const key of Object.keys(obj)) {
    const v = (obj as any)[key];
    
    if (typeof v === 'string') {
      out[key] = sanitizeText(v, maxLength);
    } else if (v && typeof v === 'object') {
      out[key] = sanitizeObject(v, maxLength);
    } else {
      out[key] = v;
    }
  }
  
  return out;
}

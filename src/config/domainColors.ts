/**
 * 🎨 SISTEMA CENTRALIZADO DE CORES DOS DOMÍNIOS SEMÂNTICOS
 * ÚNICA FONTE DE VERDADE para cores dos Domínios
 * Usado em: Nuvem, Gráficos, Tabelas, Tooltips
 */

// Paleta de 6 cores DISTINTAS e acessíveis (WCAG AA)
export const SEMANTIC_DOMAIN_COLORS = {
  "Cultura e Lida Gaúcha": {
    hsl: "hsl(142, 71%, 45%)",
    hex: "#24A65B",
    label: "Cultura Gaúcha"
  },
  "Natureza e Paisagem": {
    hsl: "hsl(200, 70%, 50%)",
    hex: "#268BC8",
    label: "Natureza"
  },
  "Sentimentos e Abstrações": {
    hsl: "hsl(280, 70%, 55%)",
    hex: "#8B5CF6",
    label: "Sentimentos"
  },
  "Ações e Processos": {
    hsl: "hsl(30, 100%, 50%)",
    hex: "#FF9500",
    label: "Ações"
  },
  "Qualidades e Estados": {
    hsl: "hsl(340, 75%, 55%)",
    hex: "#EC4899",
    label: "Qualidades"
  },
  "Partes do Corpo e Seres Vivos": {
    hsl: "hsl(0, 72%, 51%)",
    hex: "#DC2626",
    label: "Corpo/Vida"
  }
} as const;

// Função para obter cor de um domínio (com fallback)
export function getDomainColor(dominio: string, format: 'hsl' | 'hex' = 'hsl'): string {
  const normalized = dominio.trim();
  const colorData = SEMANTIC_DOMAIN_COLORS[normalized as keyof typeof SEMANTIC_DOMAIN_COLORS];
  
  if (!colorData) {
    console.warn(`⚠️ Domínio "${dominio}" sem cor definida. Usando fallback.`);
    return format === 'hsl' ? 'hsl(0, 0%, 60%)' : '#94a3b8';
  }
  
  return colorData[format];
}

// Função para obter label curto
export function getDomainLabel(dominio: string): string {
  const colorData = SEMANTIC_DOMAIN_COLORS[dominio as keyof typeof SEMANTIC_DOMAIN_COLORS];
  return colorData?.label || dominio;
}

// Para uso em gráficos Recharts (array)
export const DOMAIN_COLOR_PALETTE = Object.values(SEMANTIC_DOMAIN_COLORS).map(d => d.hex);

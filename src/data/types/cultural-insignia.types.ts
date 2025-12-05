/**
 * Sistema de Insígnias Culturais
 * 
 * Separa a função semântica (DS) da identidade cultural/regional.
 * Uma palavra pode ter múltiplas insígnias culturais enquanto mantém
 * um único domínio semântico funcional.
 * 
 * Exemplo: "xergão" → DS: Equipamentos de Montaria | Insígnias: Gaúcho, Platino
 */

export enum InsigniaCultural {
  GAUCHO = 'Gaúcho',
  NORDESTINO = 'Nordestino',
  SERTANEJO = 'Sertanejo',
  INDIGENA = 'Indígena',
  PLATINO = 'Platino',
  AFRO_BRASILEIRO = 'Afro-Brasileiro',
  CAIPIRA = 'Caipira',
  BRASILEIRO = 'Brasileiro'
}

export const INSIGNIAS_OPTIONS = [
  { value: InsigniaCultural.GAUCHO, label: '🏇 Gaúcho', description: 'Cultura gaúcha sul-rio-grandense' },
  { value: InsigniaCultural.NORDESTINO, label: '☀️ Nordestino', description: 'Cultura nordestina brasileira' },
  { value: InsigniaCultural.SERTANEJO, label: '🌵 Sertanejo', description: 'Cultura sertaneja brasileira' },
  { value: InsigniaCultural.INDIGENA, label: '🪶 Indígena', description: 'Culturas indígenas brasileiras' },
  { value: InsigniaCultural.PLATINO, label: '🌎 Platino', description: 'Influência platina (Argentina/Uruguai)' },
  { value: InsigniaCultural.AFRO_BRASILEIRO, label: '🥁 Afro-Brasileiro', description: 'Culturas afro-brasileiras' },
  { value: InsigniaCultural.CAIPIRA, label: '🌾 Caipira', description: 'Cultura caipira do interior' },
  { value: InsigniaCultural.BRASILEIRO, label: '🇧🇷 Brasileiro', description: 'Cultura brasileira geral' }
];

export interface WordWithInsignias {
  palavra: string;
  tagset_codigo: string | null;
  insignias_culturais: string[];
}

/**
 * Critérios para atribuição de insígnias:
 * 
 * PRIMÁRIA: Baseada no corpus de origem
 * - corpus_type === 'gaucho' → Insígnia Gaúcho
 * - corpus_type === 'nordestino' → Insígnia Nordestino
 * 
 * SECUNDÁRIAS: Baseadas no léxico dialectal
 * - Se palavra existe em dialectal_lexicon.origem_regionalista → adiciona essas insígnias
 * - Se possui influencia_platina = true → adiciona Platino
 * - Se possui contextos_culturais com marcadores específicos → adiciona respectivas insígnias
 */
export interface InsigniaAttribution {
  primary: InsigniaCultural;
  secondary: InsigniaCultural[];
  confidence: number;
  source: 'corpus' | 'dialectal_lexicon' | 'ai_inference';
}

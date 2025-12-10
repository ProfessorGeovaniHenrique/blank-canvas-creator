import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { loadActiveTagsets, isValidTagset, getN2Tagsets } from "../_shared/tagset-loader.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NCWord {
  palavra: string;
  contexto_kwic?: string;
  song_id?: string;
  hits_count?: number;
}

interface NCSuggestion {
  palavra: string;
  tagset_sugerido: string;
  tagset_nome: string;
  confianca: number;
  justificativa: string;
  fonte: 'dialectal_lexicon' | 'ai_gemini' | 'pattern_match';
}

/**
 * 🆕 Padrões conhecidos para classificação automática
 * Códigos serão validados contra banco de dados em runtime
 */
const PATTERN_RULES_RAW = [
  // Interjeições gaúchas → MG (será validado se MG existe)
  { pattern: /^(iê|ité|tchê|bah|eita|uai|opa|oxe|vixe|arretado)$/i, tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.88 },
  // Sufixos diminutivos típicos → EQ ou MG
  { pattern: /inho$|inha$|zinho$|zinha$/i, tagset: 'EQ', nome: 'Estados e Qualidades', confianca: 0.75 },
  // Verbos no gerúndio → AC
  { pattern: /ando$|endo$|indo$/i, tagset: 'AC', nome: 'Ações e Processos', confianca: 0.70 },
  // Advérbios típicos → MG
  { pattern: /mente$/i, tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.80 },
];

/**
 * 🆕 Mapeamento dinâmico de categorias do léxico dialetal para tagsets
 * Carrega N2 tagsets do banco para obter mapeamentos corretos
 */
async function getCategoryToTagsetMapping(): Promise<Record<string, { tagset: string; nome: string }>> {
  const n2Tagsets = await getN2Tagsets();
  
  // Construir mapeamento baseado em N2 tagsets existentes
  const mapping: Record<string, { tagset: string; nome: string }> = {
    // Defaults seguros usando N1
    'fauna': { tagset: 'NA', nome: 'Natureza' },
    'flora': { tagset: 'NA', nome: 'Natureza' },
    'alimentação': { tagset: 'AP', nome: 'Atividades e Práticas' },
    'vestuário': { tagset: 'AP', nome: 'Atividades e Práticas' },
    'indumentária': { tagset: 'AP', nome: 'Atividades e Práticas' },
    'música': { tagset: 'CC', nome: 'Cultura e Conhecimento' },
    'dança': { tagset: 'CC', nome: 'Cultura e Conhecimento' },
    'default': { tagset: 'CC', nome: 'Cultura e Conhecimento' }
  };
  
  // Tentar encontrar N2 mais específicos no banco
  for (const tagset of n2Tagsets) {
    const code = tagset.codigo.toLowerCase();
    const nome = tagset.nome.toLowerCase();
    
    if (nome.includes('fauna') || code.includes('fa')) {
      mapping['fauna'] = { tagset: tagset.codigo, nome: tagset.nome };
    }
    if (nome.includes('flora') || code.includes('fl')) {
      mapping['flora'] = { tagset: tagset.codigo, nome: tagset.nome };
    }
    if (nome.includes('alimenta') || code.includes('ali')) {
      mapping['alimentação'] = { tagset: tagset.codigo, nome: tagset.nome };
    }
    if (nome.includes('vestua') || nome.includes('indument') || code.includes('ves')) {
      mapping['vestuário'] = { tagset: tagset.codigo, nome: tagset.nome };
      mapping['indumentária'] = { tagset: tagset.codigo, nome: tagset.nome };
    }
    if (nome.includes('música') || nome.includes('arte') || code.includes('art')) {
      mapping['música'] = { tagset: tagset.codigo, nome: tagset.nome };
      mapping['dança'] = { tagset: tagset.codigo, nome: tagset.nome };
    }
  }
  
  return mapping;
}

async function checkDialectalLexicon(
  supabaseUrl: string,
  supabaseKey: string,
  palavra: string
): Promise<NCSuggestion | null> {
  const normalizedWord = palavra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Usar fetch direto para evitar problemas de tipagem
  const response = await fetch(
    `${supabaseUrl}/rest/v1/dialectal_lexicon?or=(verbete_normalizado.eq.${encodeURIComponent(normalizedWord)},variantes.cs.{${encodeURIComponent(palavra)}})&limit=1`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const entry = data[0];

  if (entry) {
    // 🆕 Carregar mapeamento dinâmico de categorias
    const categoryMapping = await getCategoryToTagsetMapping();
    
    // Mapear categoria temática para tagset
    const categorias = (entry.categorias_tematicas || []) as string[];
    let tagset = categoryMapping['default'].tagset;
    let tagsetNome = categoryMapping['default'].nome;

    // Tentar encontrar categoria específica
    for (const cat of categorias) {
      const catLower = cat.toLowerCase();
      if (categoryMapping[catLower]) {
        tagset = categoryMapping[catLower].tagset;
        tagsetNome = categoryMapping[catLower].nome;
        break;
      }
    }

    // 🆕 Validar tagset existe no banco
    const isValid = await isValidTagset(tagset);
    if (!isValid) {
      console.warn(`[suggest-nc-classification] Tagset ${tagset} não existe, usando fallback CC`);
      tagset = 'CC';
      tagsetNome = 'Cultura e Conhecimento';
    }

    return {
      palavra,
      tagset_sugerido: tagset,
      tagset_nome: tagsetNome,
      confianca: 0.95,
      justificativa: `Encontrado no léxico dialetal gaúcho: "${entry.verbete}"`,
      fonte: 'dialectal_lexicon'
    };
  }

  return null;
}

async function checkPatternMatch(palavra: string): Promise<NCSuggestion | null> {
  for (const rule of PATTERN_RULES_RAW) {
    if (rule.pattern.test(palavra)) {
      // 🆕 Validar se o tagset existe no banco
      const isValid = await isValidTagset(rule.tagset);
      
      if (!isValid) {
        console.warn(`[suggest-nc-classification] Pattern rule tagset ${rule.tagset} não existe no banco`);
        continue; // Pular regra com código inválido
      }
      
      return {
        palavra,
        tagset_sugerido: rule.tagset,
        tagset_nome: rule.nome,
        confianca: rule.confianca,
        justificativa: `Padrão morfológico identificado: ${rule.pattern.toString()}`,
        fonte: 'pattern_match'
      };
    }
  }
  return null;
}

async function getAISuggestion(
  palavras: NCWord[],
  tagsetsDisponiveis: { codigo: string; nome: string; descricao: string | null }[]
): Promise<NCSuggestion[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return [];
  }

  const tagsetsStr = tagsetsDisponiveis
    .slice(0, 50) // Limitar para não exceder contexto
    .map(t => `${t.codigo}: ${t.nome}${t.descricao ? ` - ${t.descricao}` : ''}`)
    .join('\n');

  const palavrasStr = palavras
    .map(p => `- "${p.palavra}"${p.contexto_kwic ? ` (contexto: "${p.contexto_kwic}")` : ''}`)
    .join('\n');

  const prompt = `Você é um linguista especializado em português brasileiro e dialeto gaúcho.

Classifique as seguintes palavras não classificadas (NC) em domínios semânticos.

DOMÍNIOS DISPONÍVEIS (CARREGADOS DO BANCO DE DADOS):
${tagsetsStr}

PALAVRAS A CLASSIFICAR:
${palavrasStr}

Para cada palavra, retorne um JSON array com objetos contendo:
- palavra: string
- tagset_sugerido: código do domínio (ex: "NA", "AC", "SE") - APENAS códigos da lista acima
- tagset_nome: nome do domínio
- confianca: número entre 0 e 1
- justificativa: breve explicação da classificação

IMPORTANTE:
- RETORNE APENAS códigos que existem na lista acima
- Se não tiver certeza, use confiança baixa (< 0.6)
- Priorize domínios específicos (N2/N3/N4) sobre genéricos (N1)
- Considere o contexto KWIC quando disponível
- NÃO invente códigos novos

Responda APENAS com o JSON array, sem markdown.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um linguista especializado em classificação semântica de palavras em português. Retorne apenas códigos válidos da lista fornecida.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Tentar parsear JSON da resposta
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      
      // 🆕 Validar cada sugestão contra o banco
      const validatedSuggestions: NCSuggestion[] = [];
      const validCodes = new Set(tagsetsDisponiveis.map(t => t.codigo));
      
      for (const s of suggestions) {
        if (validCodes.has(s.tagset_sugerido)) {
          validatedSuggestions.push({
            ...s,
            fonte: 'ai_gemini' as const
          });
        } else {
          console.warn(`[suggest-nc-classification] AI sugeriu código inválido ${s.tagset_sugerido} para "${s.palavra}"`);
        }
      }
      
      return validatedSuggestions;
    }

    return [];
  } catch (error) {
    console.error('AI suggestion error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { palavras, limit = 20 } = await req.json() as { palavras?: NCWord[]; limit?: number };

    // Se não fornecer palavras, buscar do cache
    let ncWords: NCWord[] = palavras || [];
    
    if (!palavras || palavras.length === 0) {
      const { data: ncData } = await supabaseClient
        .from('semantic_disambiguation_cache')
        .select('palavra, song_id, hits_count')
        .eq('tagset_codigo', 'NC')
        .order('hits_count', { ascending: false })
        .limit(limit);

      ncWords = (ncData || []).map((w: any) => ({
        palavra: w.palavra,
        song_id: w.song_id,
        hits_count: w.hits_count
      }));
    }

    if (ncWords.length === 0) {
      return new Response(JSON.stringify({ suggestions: [], message: 'Nenhuma palavra NC encontrada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 🆕 Buscar tagsets ativos dinamicamente
    const tagsets = await loadActiveTagsets();
    const tagsetsForAI = tagsets.map(t => ({
      codigo: t.codigo,
      nome: t.nome,
      descricao: t.descricao
    }));
    
    console.log(`[suggest-nc-classification] ${tagsets.length} tagsets válidos carregados do banco`);

    const suggestions: NCSuggestion[] = [];
    const wordsNeedingAI: NCWord[] = [];

    // Fase 1: Verificar léxico dialetal e padrões
    for (const word of ncWords) {
      // Tentar léxico dialetal primeiro
      const dialectalSuggestion = await checkDialectalLexicon(supabaseUrl, supabaseKey, word.palavra);
      if (dialectalSuggestion) {
        suggestions.push(dialectalSuggestion);
        continue;
      }

      // Tentar pattern matching
      const patternSuggestion = await checkPatternMatch(word.palavra);
      if (patternSuggestion) {
        suggestions.push(patternSuggestion);
        continue;
      }

      // Adicionar à lista para IA
      wordsNeedingAI.push(word);
    }

    // Fase 2: Usar IA para palavras restantes (em batch)
    if (wordsNeedingAI.length > 0 && tagsetsForAI.length > 0) {
      const aiSuggestions = await getAISuggestion(wordsNeedingAI, tagsetsForAI);
      suggestions.push(...aiSuggestions);
    }

    // Ordenar por confiança
    suggestions.sort((a, b) => b.confianca - a.confianca);

    console.log(`[suggest-nc-classification] Processadas ${ncWords.length} palavras, ${suggestions.length} sugestões geradas (todas validadas contra banco)`);

    return new Response(JSON.stringify({
      suggestions,
      stats: {
        total_palavras: ncWords.length,
        dialectal_lexicon: suggestions.filter(s => s.fonte === 'dialectal_lexicon').length,
        pattern_match: suggestions.filter(s => s.fonte === 'pattern_match').length,
        ai_gemini: suggestions.filter(s => s.fonte === 'ai_gemini').length,
        sem_sugestao: ncWords.length - suggestions.length,
        tagsets_validos_disponiveis: tagsets.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[suggest-nc-classification] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

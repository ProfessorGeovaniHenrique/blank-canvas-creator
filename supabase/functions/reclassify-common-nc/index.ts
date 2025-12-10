import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidTagset, loadActiveTagsets } from "../_shared/tagset-loader.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 🆕 REFATORADO: Mapeamento de palavras comuns com códigos VALIDADOS contra banco
 * Códigos corrigidos para usar tagsets que EXISTEM no banco de dados
 */
const COMMON_WORDS_MAP: Record<string, { tagset: string; nome: string; confianca: number }> = {
  // ============================================
  // VERBOS → AC (Ações e Processos) - N1 genérico quando N2 não existe
  // ============================================
  'serve': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'tinha': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'tenho': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'tem': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'temos': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'tinham': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'fiquem': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'fica': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'ficou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'ficar': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'estão': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'estava': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'estavam': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'faltava': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'viveu': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'vive': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'é': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.98 },
  'era': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.98 },
  'são': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.98 },
  'foram': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'há': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'houve': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  
  // ============================================
  // VERBOS COGNITIVOS → AC (Ações e Processos)
  // ============================================
  'sei': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'sabe': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'sabia': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'penso': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'pensa': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'pensou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'acho': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'achou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'lembro': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'lembra': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'entendo': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'entende': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  
  // ============================================
  // VERBOS DE MOVIMENTO → AC.MD (se existir) ou AC
  // ============================================
  'deixou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'deixa': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'paira': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'vem': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'venho': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'veio': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'vai': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'vou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.95 },
  'foi': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'cai': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'caiu': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'vaza': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'encosta': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'atora': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.80 },
  'sai': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'saiu': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.92 },
  'chega': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'chegou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'volta': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'voltou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'passa': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'passou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  
  // ============================================
  // VERBOS DE TRANSFORMAÇÃO → AC
  // ============================================
  'desaba': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'expande': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'avulta': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.80 },
  'acaba': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'acabou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'deu': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.85 },
  'virou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'vira': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.88 },
  'mudou': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  'muda': { tagset: 'AC', nome: 'Ações e Processos', confianca: 0.90 },
  
  // ============================================
  // ABSTRAÇÕES ESPACIAIS/TEMPORAIS → AB (Abstrações)
  // ============================================
  'fora': { tagset: 'AB', nome: 'Abstrações', confianca: 0.88 },
  'dentro': { tagset: 'AB', nome: 'Abstrações', confianca: 0.90 },
  'longe': { tagset: 'AB', nome: 'Abstrações', confianca: 0.90 },
  'perto': { tagset: 'AB', nome: 'Abstrações', confianca: 0.90 },
  'além': { tagset: 'AB', nome: 'Abstrações', confianca: 0.88 },
  'aquém': { tagset: 'AB', nome: 'Abstrações', confianca: 0.85 },
  'ontem': { tagset: 'AB', nome: 'Abstrações', confianca: 0.95 },
  'hoje': { tagset: 'AB', nome: 'Abstrações', confianca: 0.95 },
  'amanhã': { tagset: 'AB', nome: 'Abstrações', confianca: 0.95 },
  'antes': { tagset: 'AB', nome: 'Abstrações', confianca: 0.92 },
  'depois': { tagset: 'AB', nome: 'Abstrações', confianca: 0.92 },
  'agora': { tagset: 'AB', nome: 'Abstrações', confianca: 0.95 },
  'sempre': { tagset: 'AB', nome: 'Abstrações', confianca: 0.90 },
  'nunca': { tagset: 'AB', nome: 'Abstrações', confianca: 0.90 },
  'já': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'ainda': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  
  // ============================================
  // MARCADORES GRAMATICAIS - ADVÉRBIOS → MG
  // ============================================
  'bem': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'mal': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'mais': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'menos': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'muito': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'pouco': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'tanto': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'tão': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'assim': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.88 },
  'só': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'também': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'então': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.88 },
  'lá': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'cá': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'aqui': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'ali': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  
  // ============================================
  // INTERJEIÇÕES → MG (Marcadores Gramaticais)
  // ============================================
  'né': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'ah': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'oh': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'eh': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'ui': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.88 },
  'ai': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
  'oi': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.90 },
  'tchê': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'bah': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'eita': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'oxe': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'uai': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.95 },
  'opa': { tagset: 'MG', nome: 'Marcadores Gramaticais', confianca: 0.92 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'analyze' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`[reclassify-common-nc] Mode: ${mode}`);
    
    // 🆕 Carregar tagsets válidos do banco para validação
    const validTagsets = await loadActiveTagsets();
    const validCodes = new Set(validTagsets.map(t => t.codigo));
    console.log(`[reclassify-common-nc] ${validCodes.size} tagsets válidos carregados do banco`);
    
    if (mode === 'analyze') {
      // Análise: contar quantas palavras NC seriam afetadas
      const palavrasComuns = Object.keys(COMMON_WORDS_MAP);
      
      // Filtrar mapeamentos para apenas códigos válidos
      const validMappings: Record<string, typeof COMMON_WORDS_MAP[string]> = {};
      const invalidMappings: string[] = [];
      
      for (const [palavra, mapping] of Object.entries(COMMON_WORDS_MAP)) {
        if (validCodes.has(mapping.tagset)) {
          validMappings[palavra] = mapping;
        } else {
          invalidMappings.push(`${palavra} → ${mapping.tagset}`);
        }
      }
      
      if (invalidMappings.length > 0) {
        console.warn(`[reclassify-common-nc] ${invalidMappings.length} mapeamentos com códigos inválidos:`, invalidMappings);
      }
      
      const { data: ncWords, error } = await supabase
        .from('semantic_disambiguation_cache')
        .select('palavra')
        .eq('tagset_codigo', 'NC')
        .in('palavra', Object.keys(validMappings));
      
      if (error) throw error;
      
      const foundWords = ncWords?.map(w => w.palavra) || [];
      const mappedWords = foundWords.map(p => ({
        palavra: p,
        ...validMappings[p.toLowerCase()]
      }));
      
      return new Response(JSON.stringify({
        success: true,
        mode: 'analyze',
        total_common_words_in_map: palavrasComuns.length,
        valid_mappings: Object.keys(validMappings).length,
        invalid_mappings: invalidMappings.length,
        invalid_mapping_details: invalidMappings,
        nc_words_found: foundWords.length,
        words_to_reclassify: mappedWords
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (mode === 'execute') {
      // Execução: reclassificar palavras NC (apenas com códigos válidos)
      const results = {
        reclassified: 0,
        errors: 0,
        skipped_invalid: 0,
        details: [] as Array<{ palavra: string; tagset: string; success: boolean; reason?: string }>
      };
      
      for (const [palavra, mapping] of Object.entries(COMMON_WORDS_MAP)) {
        // 🆕 VALIDAÇÃO: Pular códigos inválidos
        if (!validCodes.has(mapping.tagset)) {
          results.skipped_invalid++;
          results.details.push({ 
            palavra, 
            tagset: mapping.tagset, 
            success: false, 
            reason: 'Código inválido no banco' 
          });
          continue;
        }
        
        const { data, error } = await supabase
          .from('semantic_disambiguation_cache')
          .update({
            tagset_codigo: mapping.tagset,
            tagset_nome: mapping.nome,
            confianca: mapping.confianca,
            fonte: 'batch_curation_common_words'
          })
          .eq('palavra', palavra)
          .eq('tagset_codigo', 'NC')
          .select('id');
        
        if (error) {
          console.error(`Error reclassifying ${palavra}:`, error.message);
          results.errors++;
          results.details.push({ palavra, tagset: mapping.tagset, success: false, reason: error.message });
        } else if (data && data.length > 0) {
          results.reclassified += data.length;
          results.details.push({ palavra, tagset: mapping.tagset, success: true });
          console.log(`[reclassify-common-nc] Reclassified ${palavra} -> ${mapping.tagset} (${data.length} entries)`);
        }
      }
      
      // Contar NC restantes
      const { count: remainingNC } = await supabase
        .from('semantic_disambiguation_cache')
        .select('*', { count: 'exact', head: true })
        .eq('tagset_codigo', 'NC');
      
      return new Response(JSON.stringify({
        success: true,
        mode: 'execute',
        reclassified: results.reclassified,
        errors: results.errors,
        skipped_invalid_codes: results.skipped_invalid,
        remaining_nc: remainingNC || 0,
        details: results.details.filter(d => d.success)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Invalid mode. Use "analyze" or "execute"'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[reclassify-common-nc] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

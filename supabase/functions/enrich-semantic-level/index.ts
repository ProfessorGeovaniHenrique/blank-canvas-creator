import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { 
  generateDomainPromptSection, 
  isValidTagset, 
  loadActiveTagsets 
} from "../_shared/tagset-loader.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentRequest {
  palavras: Array<{
    palavra: string;
    tagset_n1: string;
    contexto: string;
  }>;
}

interface EnrichmentResult {
  palavra: string;
  tagset_n2: string;
  confianca: number;
  justificativa: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody: EnrichmentRequest = await req.json();
    const { palavras } = requestBody;

    console.log(`[enrich-semantic-level] Processando ${palavras.length} palavras para enriquecimento N2`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // 🆕 Carregar domínios DINAMICAMENTE do banco de dados
    const dynamicDomains = await generateDomainPromptSection();
    console.log('[enrich-semantic-level] Domínios carregados dinamicamente do banco');

    // Preparar prompt para batch de palavras N1 → N2
    const palavrasList = palavras.map((p, i) => {
      return `${i + 1}. Palavra: "${p.palavra}" | Domínio Atual: ${p.tagset_n1} | Contexto: "${p.contexto}"`;
    }).join('\n');

    const prompt = `Você é um especialista em análise semântica. Estas palavras foram classificadas em domínios N1 (genéricos). Sua tarefa é especificar qual SUBDOMÍNIO N2 melhor se aplica.

**DOMÍNIOS SEMÂNTICOS (CARREGADOS DO BANCO DE DADOS):**
${dynamicDomains}

**REGRAS CRÍTICAS:**
1. Retorne APENAS códigos que existam na lista acima
2. Se nenhum N2 se aplica claramente, retorne o código N1 original
3. Se N2 se aplica, retorne o código completo (ex: "SE.TRI", "NA.FA")
4. NÃO invente códigos - use apenas os listados

**PALAVRAS PARA ENRIQUECER:**
${palavrasList}

**RETORNE JSON ARRAY (ordem idêntica):**
[
  {"palavra": "palavra1", "tagset_n2": "XX.YY", "confianca": 0.95, "justificativa": "razão"},
  {"palavra": "palavra2", "tagset_n2": "ZZ", "confianca": 0.85, "justificativa": "razão"},
  ...
]`;

    // Chamar Gemini via Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um classificador semântico preciso. Retorne APENAS JSON array válido com códigos existentes.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[enrich-semantic-level] Erro na API Lovable:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    console.log('[enrich-semantic-level] Resposta bruta do Gemini:', content.substring(0, 500));

    // Limpar markdown code blocks se existirem
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Parse JSON array da resposta com múltiplas estratégias
    let results: EnrichmentResult[];
    
    // Estratégia 1: Regex para capturar array JSON
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      try {
        results = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('[enrich-semantic-level] Erro ao parsear JSON extraído:', parseError);
        throw new Error('Failed to parse extracted JSON array');
      }
    } else {
      // Estratégia 2: Tentar parsear o conteúdo completo (caso seja só JSON)
      try {
        const parsed = JSON.parse(content.trim());
        results = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        console.error('[enrich-semantic-level] Resposta sem JSON válido. Conteúdo completo:', content);
        throw new Error('Invalid enrichment response format');
      }
    }

    // 🆕 VALIDAÇÃO: Verificar se tagsets retornados existem no banco
    let updatedCount = 0;
    let invalidCount = 0;
    
    for (const result of results) {
      if (result.tagset_n2 && result.tagset_n2.includes('.')) {
        // Validar se o código existe no banco
        const isValid = await isValidTagset(result.tagset_n2);
        
        if (!isValid) {
          console.warn(`[enrich-semantic-level] Código inválido rejeitado: ${result.tagset_n2} para "${result.palavra}"`);
          invalidCount++;
          continue; // Pular códigos inválidos
        }
        
        // Apenas atualizar se realmente mudou para N2 válido
        const { error } = await supabaseClient
          .from('semantic_disambiguation_cache')
          .update({
            tagset_codigo: result.tagset_n2,
            confianca: result.confianca,
            justificativa: result.justificativa,
          })
          .eq('palavra', result.palavra.toLowerCase());

        if (!error) {
          updatedCount++;
        }
      }
    }

    console.log(`[enrich-semantic-level] Concluído: ${updatedCount}/${results.length} palavras enriquecidas para N2 (${invalidCount} códigos inválidos rejeitados)`);

    return new Response(
      JSON.stringify({
        success: true,
        resultados: results,
        updatedCount,
        invalidTagsetsRejected: invalidCount,
        processingTime: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('[enrich-semantic-level] Erro:', errorObj.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorObj.message,
        processingTime: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

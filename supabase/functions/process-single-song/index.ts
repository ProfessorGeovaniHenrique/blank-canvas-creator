import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { letra, metadata } = await req.json();

    if (!letra) {
      throw new Error('Letra da música é obrigatória');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Step 1: POS Annotation
    const { data: posData, error: posError } = await supabaseClient.functions.invoke('annotate-pos', {
      body: { texto: letra, idioma: 'pt' }
    });

    if (posError) throw posError;

    // Step 2: Semantic Domain Annotation
    const words = letra.split(/\s+/).filter((w: string) => w.length > 0);
    const semanticDomains: Record<string, number> = {};
    let processedWords = 0;

    // Process words in batches
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const contextoEsquerdo = words.slice(Math.max(0, i - 5), i).join(' ');
      const contextoDireito = words.slice(i + 1, Math.min(words.length, i + 6)).join(' ');

      const { data: semanticData, error: semanticError } = await supabaseClient.functions.invoke('annotate-semantic-domain', {
        body: {
          palavra: word,
          contexto_esquerdo: contextoEsquerdo,
          contexto_direito: contextoDireito
        }
      });

      if (!semanticError && semanticData?.tagset_codigo) {
        const domain = semanticData.tagset_codigo;
        semanticDomains[domain] = (semanticDomains[domain] || 0) + 1;
      }

      processedWords++;
      
      // Limit processing for performance (process only first 100 words for demo)
      if (processedWords >= 100) break;
    }

    // Step 3: Calculate statistics
    const posStats = {
      totalTokens: posData?.tokens?.length || 0,
      distribuicaoPOS: posData?.tokens?.reduce((acc: any, token: any) => {
        acc[token.pos] = (acc[token.pos] || 0) + 1;
        return acc;
      }, {}) || {},
      typeTokenRatio: posData?.statistics?.typeTokenRatio || 0,
      densidadeLexical: posData?.statistics?.densidadeLexical || 0
    };

    return new Response(
      JSON.stringify({
        semanticDomains: {
          domains: semanticDomains,
          totalDomains: Object.keys(semanticDomains).length
        },
        posStats,
        rawText: letra,
        metadata
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error processing song:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerbeteGutenberg {
  verbete: string;
  verbeteNormalizado: string;
  classeGramatical: string | null;
  genero: string | null;
  definicoes: Array<{
    numero: number;
    texto: string;
    contexto: string | null;
  }>;
  etimologia: string | null;
  origemLingua: string | null;
  sinonimos: string[];
  exemplos: string[];
  arcaico: boolean;
  regional: boolean;
  figurado: boolean;
  popular: boolean;
}

function normalizeWord(word: string): string {
  return word.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

function parseGutenbergEntry(entryText: string): VerbeteGutenberg | null {
  try {
    const lines = entryText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;
    
    // Linha 1: *Verbete*,
    const verbeteMatch = lines[0].match(/^\*([A-Za-záàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ\-]+)\*,?/);
    if (!verbeteMatch) return null;
    
    const verbete = verbeteMatch[1];
    
    // Linha 2: _f._ ou _m._ ou _adj._ etc.
    const classeMatch = lines[1].match(/_([a-z\s\.]+)_/i);
    const classeGramatical = classeMatch ? classeMatch[1].trim() : null;
    
    // Gênero
    let genero: string | null = null;
    if (classeGramatical) {
      if (classeGramatical.includes('f.')) genero = 'feminino';
      else if (classeGramatical.includes('m.')) genero = 'masculino';
    }
    
    // Definição (texto após a classe gramatical)
    let defTexto = '';
    for (let i = 2; i < lines.length && i < 10; i++) {
      if (lines[i].startsWith('(Do ') || lines[i].startsWith('(Lat.')) break;
      defTexto += lines[i] + ' ';
    }
    
    const definicoes = [{
      numero: 1,
      texto: defTexto.trim().substring(0, 500),
      contexto: null
    }];
    
    // Etimologia
    let etimologia: string | null = null;
    let origemLingua: string | null = null;
    const etimologiaMatch = entryText.match(/\((Do|Lat\.|Do lat\.|Do gr\.)\s+([^)]+)\)/i);
    if (etimologiaMatch) {
      etimologia = etimologiaMatch[2];
      if (etimologiaMatch[1].includes('lat')) origemLingua = 'latim';
      else if (etimologiaMatch[1].includes('gr')) origemLingua = 'grego';
    }
    
    // Marcações especiais
    const arcaico = entryText.includes('Ant.') || entryText.includes('Antigo');
    const regional = entryText.includes('Prov.') || entryText.includes('Provincial') || entryText.includes('Bras.');
    const figurado = entryText.includes('Fig.');
    const popular = entryText.includes('Pop.');
    
    return {
      verbete,
      verbeteNormalizado: normalizeWord(verbete),
      classeGramatical,
      genero,
      definicoes,
      etimologia,
      origemLingua,
      sinonimos: [],
      exemplos: [],
      arcaico,
      regional,
      figurado,
      popular
    };
  } catch (error) {
    console.error('Erro ao parsear verbete Gutenberg:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileContent, batchSize = 1000, startIndex = 0 } = await req.json();
    
    if (!fileContent) {
      throw new Error('fileContent é obrigatório');
    }

    // Dividir em verbetes (formato: *Palavra*,)
    const verbetes = fileContent.split(/(?=\n\*[A-Za-záàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ\-]+\*,)/);
    
    const endIndex = Math.min(startIndex + batchSize, verbetes.length);
    const batch = verbetes.slice(startIndex, endIndex);
    
    let processed = 0;
    let errors = 0;
    const errorLog: string[] = [];

    console.log(`Processando Gutenberg: lote ${startIndex}-${endIndex} de ${verbetes.length} verbetes...`);

    for (let i = 0; i < batch.length; i++) {
      const verbeteRaw = batch[i];
      
      try {
        const verbete = parseGutenbergEntry(verbeteRaw);
        if (!verbete) {
          errors++;
          continue;
        }

        const { error: insertError } = await supabaseClient
          .from('gutenberg_lexicon')
          .insert({
            verbete: verbete.verbete,
            verbete_normalizado: verbete.verbeteNormalizado,
            classe_gramatical: verbete.classeGramatical,
            genero: verbete.genero,
            definicoes: verbete.definicoes,
            etimologia: verbete.etimologia,
            origem_lingua: verbete.origemLingua,
            sinonimos: verbete.sinonimos,
            exemplos: verbete.exemplos,
            arcaico: verbete.arcaico,
            regional: verbete.regional,
            figurado: verbete.figurado,
            popular: verbete.popular,
            confianca_extracao: 0.85
          });

        if (insertError) {
          console.error('Erro ao inserir:', insertError);
          errors++;
          errorLog.push(`Verbete ${startIndex + i}: ${insertError.message}`);
          continue;
        }

        processed++;
        
        if (processed % 100 === 0) {
          console.log(`Processados ${processed} verbetes Gutenberg...`);
        }
      } catch (err) {
        console.error(`Erro processando verbete ${startIndex + i}:`, err);
        errors++;
        errorLog.push(`Verbete ${startIndex + i}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`Lote concluído: ${processed} verbetes, ${errors} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors,
        startIndex,
        endIndex,
        totalVerbetes: verbetes.length,
        hasMore: endIndex < verbetes.length,
        errorLog: errorLog.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro no processamento Gutenberg:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

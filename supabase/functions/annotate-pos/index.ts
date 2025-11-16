// Deno Edge Runtime

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface POSToken {
  palavra: string;
  lema: string;
  pos: string;
  posDetalhada: string;
  features: Record<string, string>;
  posicao: number;
}

// spaCy POS tags to Universal Dependencies mapping
const SPACY_TO_UPOS: Record<string, string> = {
  'NOUN': 'NOUN',
  'PROPN': 'PROPN',
  'VERB': 'VERB',
  'ADJ': 'ADJ',
  'ADV': 'ADV',
  'PRON': 'PRON',
  'DET': 'DET',
  'ADP': 'ADP',
  'NUM': 'NUM',
  'CONJ': 'CCONJ',
  'SCONJ': 'SCONJ',
  'INTJ': 'INTJ',
  'AUX': 'AUX',
  'PART': 'PART',
  'PUNCT': 'PUNCT',
  'SYM': 'SYM',
  'X': 'X',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto, idioma = 'pt' } = await req.json();

    if (!texto || typeof texto !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Texto inválido ou ausente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[annotate-pos] Processando ${texto.length} caracteres em idioma ${idioma}`);

    // Call Python spaCy service via external API
    // For now, we'll use a mock implementation that simulates spaCy output
    // In production, this should call a Python service with spaCy installed
    const tokens = await processWithSpacy(texto, idioma);

    console.log(`[annotate-pos] Processados ${tokens.length} tokens`);

    return new Response(
      JSON.stringify({ tokens }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[annotate-pos] Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar texto' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Simulates spaCy processing for Portuguese text
 * In production, this should call an actual Python service with spaCy
 */
async function processWithSpacy(texto: string, idioma: string): Promise<POSToken[]> {
  // Simple tokenization and POS tagging simulation
  // This is a placeholder - in production, integrate with actual spaCy service
  
  const words = texto
    .toLowerCase()
    .replace(/[^\w\sáàâãéêíóôõúç]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  const tokens: POSToken[] = words.map((palavra, index) => {
    // Simple heuristic-based POS tagging (placeholder)
    const pos = inferPOS(palavra);
    const lema = inferLemma(palavra, pos);
    const features = inferFeatures(palavra, pos);

    return {
      palavra,
      lema,
      pos: SPACY_TO_UPOS[pos] || pos,
      posDetalhada: pos,
      features,
      posicao: index,
    };
  });

  return tokens;
}

/**
 * Simple heuristic POS inference (placeholder for spaCy)
 */
function inferPOS(palavra: string): string {
  // Articles and determiners
  if (['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'este', 'esta', 'esse', 'essa'].includes(palavra)) {
    return 'DET';
  }
  
  // Prepositions
  if (['de', 'em', 'para', 'por', 'com', 'sem', 'sobre', 'até', 'desde'].includes(palavra)) {
    return 'ADP';
  }
  
  // Conjunctions
  if (['e', 'ou', 'mas', 'que', 'se', 'porque', 'quando', 'como'].includes(palavra)) {
    return 'CONJ';
  }
  
  // Pronouns
  if (['eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'me', 'te', 'se', 'nos', 'vos'].includes(palavra)) {
    return 'PRON';
  }
  
  // Verb endings
  if (palavra.match(/(ar|er|ir|ando|endo|indo|ado|ido|ou|ei|ia|ava)$/)) {
    return 'VERB';
  }
  
  // Adjective endings
  if (palavra.match(/(oso|osa|vel|al|ante|ente|inte)$/)) {
    return 'ADJ';
  }
  
  // Adverb endings
  if (palavra.endsWith('mente')) {
    return 'ADV';
  }
  
  // Default to NOUN
  return 'NOUN';
}

/**
 * Simple lemmatization (placeholder for spaCy)
 */
function inferLemma(palavra: string, pos: string): string {
  if (pos === 'VERB') {
    // Remove common verb endings
    return palavra.replace(/(ando|endo|indo|ado|ido|ou|ei|ia|ava|am|em|ia|iam)$/, 'ar');
  }
  
  if (pos === 'ADJ') {
    // Remove gender/number markers
    return palavra.replace(/(os|as|a)$/, 'o');
  }
  
  if (pos === 'NOUN') {
    // Remove plural markers
    return palavra.replace(/(s|es|ões)$/, '');
  }
  
  return palavra;
}

/**
 * Simple morphological feature inference (placeholder for spaCy)
 */
function inferFeatures(palavra: string, pos: string): Record<string, string> {
  const features: Record<string, string> = {};
  
  if (pos === 'VERB') {
    if (palavra.match(/(ando|endo|indo)$/)) {
      features.tempo = 'Pres';
      features.modo = 'Ger';
    } else if (palavra.match(/(ado|ido)$/)) {
      features.tempo = 'Past';
    } else if (palavra.match(/(ava|ia)$/)) {
      features.tempo = 'Past';
      features.modo = 'Ind';
    }
  }
  
  if (palavra.match(/(os|as|es|ões)$/)) {
    features.numero = 'Plur';
  } else {
    features.numero = 'Sing';
  }
  
  if (palavra.match(/(o|os)$/)) {
    features.genero = 'Masc';
  } else if (palavra.match(/(a|as)$/)) {
    features.genero = 'Fem';
  }
  
  return features;
}

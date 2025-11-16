import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerbeteDialectal {
  verbete: string;
  verbeteNormalizado: string;
  origemRegionalista: string[];
  origemPrimaria: string;
  classeGramatical: string | null;
  marcacaoTemporal: string | null;
  frequenciaUso: string;
  definicoes: Array<{
    numero: number;
    texto: string;
    contexto: string | null;
    exemplos: string[];
    citacoesAutores: string[];
  }>;
  sinonimos: string[];
  remissoes: string[];
  variantes: string[];
  contextosCulturais: {
    costumes?: string[];
    crencas?: string[];
    divertimentos?: string[];
    fraseologias?: string[];
  };
  influenciaPlatina: boolean;
  termosEspanhol: string[];
  referenciasDicionarios: string[];
  categoriasTematicas: string[];
}

function normalizeWord(word: string): string {
  return word.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferCategorias(
  verbete: string,
  definicoes: any[],
  contextos: any
): string[] {
  const categorias = new Set<string>();
  const texto = `${verbete} ${definicoes.map(d => d.texto).join(' ')} ${JSON.stringify(contextos)}`.toLowerCase();
  
  const mapeamento: Record<string, string[]> = {
    'fauna': ['ave', 'animal', 'gado', 'cavalo', 'égua', 'boi', 'garça', 'gafanhoto', 'pássaro', 'peixe'],
    'flora': ['planta', 'árvore', 'erva', 'capim', 'mato', 'flor'],
    'lida_campeira': ['campeiro', 'lida', 'trabalho', 'pastoreio', 'doma', 'laço', 'rodeio'],
    'vestimenta': ['roupa', 'traje', 'bombacha', 'lenço', 'chapéu', 'galochas', 'poncho'],
    'culinaria': ['comida', 'prato', 'churrasco', 'carne', 'mate', 'chimarrão'],
    'tradicao': ['costume', 'tradição', 'cultura', 'pampa', 'gaúcho'],
    'divertimento': ['jogo', 'diversão', 'rinha', 'festa', 'baile', 'dança'],
    'geografia': ['campo', 'coxilha', 'banhado', 'pampa', 'estância', 'tapera'],
    'crenca': ['crença', 'superstição', 'lenda', 'breve', 'filtro', 'feitiço']
  };
  
  for (const [categoria, palavrasChave] of Object.entries(mapeamento)) {
    if (palavrasChave.some(palavra => texto.includes(palavra))) {
      categorias.add(categoria);
    }
  }
  
  if (contextos.costumes?.length) categorias.add('tradicao');
  if (contextos.crencas?.length) categorias.add('crenca');
  if (contextos.divertimentos?.length) categorias.add('divertimento');
  if (contextos.fraseologias?.length) categorias.add('linguagem');
  
  return Array.from(categorias);
}

function parseVerbete(verbeteRaw: string): VerbeteDialectal | null {
  try {
    const lines = verbeteRaw.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;
    
    // Extrair verbete (primeira linha em maiúsculas)
    const headerMatch = lines[0].match(/^([A-ZÁÀÃÉÊÓÔÚÇ\-]+)/);
    if (!headerMatch) return null;
    
    const verbete = headerMatch[1];
    
    // Buscar origem (BRAS), (PORT), (PLAT), etc.
    const origemMatch = lines[0].match(/\(([A-Z]+)\)/);
    const origemPrimaria = origemMatch ? origemMatch[1] : 'BRAS';
    
    // Buscar classe gramatical
    const classeMatch = verbeteRaw.match(/\b(S\.m\.|S\.f\.|Adj\.|V\.|Adv\.|Prep\.|Conj\.)\b/i);
    const classeGramatical = classeMatch ? classeMatch[1] : null;
    
    // Marcações temporais
    const marcacaoTemporal = verbeteRaw.includes('ANT') ? 'ANT' : verbeteRaw.includes('DES') ? 'DES' : null;
    
    // Frequência de uso
    let frequenciaUso = 'comum';
    if (verbeteRaw.includes('[r/us.]')) frequenciaUso = 'raro';
    else if (verbeteRaw.includes('[m/us.]')) frequenciaUso = 'medio';
    else if (verbeteRaw.includes('[n/d.]')) frequenciaUso = 'desconhecido';
    
    // Definições (simplificado - pegar texto após classe gramatical)
    const defTexto = lines.slice(1).join(' ').substring(0, 500);
    const definicoes = [{
      numero: 1,
      texto: defTexto,
      contexto: verbeteRaw.includes('FIG') ? 'FIG' : null,
      exemplos: [],
      citacoesAutores: []
    }];
    
    // Sinonimos (buscar "O mesmo que")
    const sinonimos: string[] = [];
    const sinonimoMatch = verbeteRaw.match(/O mesmo que\s+([a-záàãéêóôúç\-]+)/i);
    if (sinonimoMatch) sinonimos.push(sinonimoMatch[1]);
    
    // Remissões (buscar "V.")
    const remissoes: string[] = [];
    const remissaoMatches = verbeteRaw.matchAll(/V\.\s+([a-záàãéêóôúç\-]+)/gi);
    for (const match of remissaoMatches) {
      remissoes.push(match[1]);
    }
    
    // Contextos culturais
    const contextosCulturais: any = {};
    if (verbeteRaw.includes('l COST:')) {
      contextosCulturais.costumes = ['Mencionado em costumes'];
    }
    if (verbeteRaw.includes('l CRE:')) {
      contextosCulturais.crencas = ['Mencionado em crenças'];
    }
    if (verbeteRaw.includes('l DIV:')) {
      contextosCulturais.divertimentos = ['Mencionado em divertimentos'];
    }
    
    // Influência platina
    const influenciaPlatina = verbeteRaw.includes('PLAT') || 
                              verbeteRaw.includes('ESP:') || 
                              origemPrimaria === 'PLAT';
    
    // Categorias temáticas
    const categoriasTematicas = inferCategorias(verbete, definicoes, contextosCulturais);
    
    return {
      verbete,
      verbeteNormalizado: normalizeWord(verbete),
      origemRegionalista: [origemPrimaria],
      origemPrimaria,
      classeGramatical,
      marcacaoTemporal,
      frequenciaUso,
      definicoes,
      sinonimos,
      remissoes,
      variantes: [],
      contextosCulturais,
      influenciaPlatina,
      termosEspanhol: [],
      referenciasDicionarios: [],
      categoriasTematicas
    };
  } catch (error) {
    console.error('Erro ao parsear verbete:', error);
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

    const { fileContent, volumeNum } = await req.json();
    
    if (!fileContent || !volumeNum) {
      throw new Error('fileContent e volumeNum são obrigatórios');
    }

    // Dividir em verbetes (assumindo ## como marcador)
    const verbetes = fileContent.split(/\n(?=[A-ZÁÀÃÉÊÓÔÚÇ\-]+\s+\()/);
    
    let processed = 0;
    let errors = 0;
    const errorLog: string[] = [];

    console.log(`Processando Volume ${volumeNum}: ${verbetes.length} verbetes...`);

    for (let i = 0; i < verbetes.length; i++) {
      const verbeteRaw = verbetes[i];
      
      try {
        const verbete = parseVerbete(verbeteRaw);
        if (!verbete) {
          errors++;
          continue;
        }

        const { error: insertError } = await supabaseClient
          .from('dialectal_lexicon')
          .insert({
            verbete: verbete.verbete,
            verbete_normalizado: verbete.verbeteNormalizado,
            origem_regionalista: verbete.origemRegionalista,
            origem_primaria: verbete.origemPrimaria,
            classe_gramatical: verbete.classeGramatical,
            marcacao_temporal: verbete.marcacaoTemporal,
            frequencia_uso: verbete.frequenciaUso,
            definicoes: verbete.definicoes,
            sinonimos: verbete.sinonimos,
            remissoes: verbete.remissoes,
            variantes: verbete.variantes,
            contextos_culturais: verbete.contextosCulturais,
            influencia_platina: verbete.influenciaPlatina,
            termos_espanhol: verbete.termosEspanhol,
            referencias_dicionarios: verbete.referenciasDicionarios,
            categorias_tematicas: verbete.categoriasTematicas,
            volume_fonte: volumeNum,
            confianca_extracao: 0.95
          });

        if (insertError) {
          console.error('Erro ao inserir:', insertError);
          errors++;
          errorLog.push(`Verbete ${i}: ${insertError.message}`);
          continue;
        }

        processed++;
        
        if (processed % 100 === 0) {
          console.log(`Processados ${processed} verbetes do Volume ${volumeNum}...`);
        }
      } catch (err) {
        console.error(`Erro processando verbete ${i}:`, err);
        errors++;
        errorLog.push(`Verbete ${i}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`Volume ${volumeNum} concluído: ${processed} verbetes, ${errors} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors,
        volumeNum,
        errorLog: errorLog.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro no processamento dialectal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

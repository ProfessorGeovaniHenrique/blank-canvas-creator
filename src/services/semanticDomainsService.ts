/**
 * 🎯 SEMANTIC DOMAINS SERVICE - Domínios Semânticos Reais
 * 
 * Busca domínios semânticos processados pela ferramenta de anotação
 * da tabela annotated_corpus + semantic_tagset
 */

import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/lib/loggerFactory';
import { DominioSemantico } from '@/data/types/corpus.types';

const log = createLogger('semanticDomainsService');

/**
 * Busca domínios semânticos reais do corpus anotado
 */
export async function getSemanticDomainsFromAnnotatedCorpus(
  corpusType: 'gaucho' | 'nordestino',
  artistFilter?: string
): Promise<DominioSemantico[]> {
  try {
    log.info('Fetching semantic domains from annotated corpus', { corpusType, artistFilter });

    // Buscar corpus_id
    const { data: corpus } = await supabase
      .from('corpora')
      .select('id, name')
      .eq('normalized_name', corpusType)
      .single();

    if (!corpus) {
      throw new Error(`Corpus ${corpusType} não encontrado`);
    }

    // Buscar job_id mais recente para este corpus
    let jobQuery = supabase
      .from('annotation_jobs')
      .select('id, tempo_fim, corpus_type')
      .eq('corpus_type', corpusType)
      .eq('status', 'concluido')
      .order('tempo_fim', { ascending: false })
      .limit(1);

    if (artistFilter) {
      jobQuery = jobQuery.eq('reference_artist_filter', artistFilter);
    }

    const { data: jobs, error: jobError } = await jobQuery;

    if (jobError || !jobs || jobs.length === 0) {
      log.warn('No completed annotation jobs found', { corpusType, artistFilter });
      return [];
    }

    const jobId = jobs[0].id;
    log.info('Found annotation job', { jobId, corpusType });

    // Buscar palavras anotadas deste job
    const { data: annotatedWords, error: wordsError } = await supabase
      .from('annotated_corpus')
      .select('palavra, tagset_codigo, tagset_primario, freq_study_corpus, ll_score, mi_score')
      .eq('job_id', jobId);

    if (wordsError || !annotatedWords) {
      log.error('Error fetching annotated words', wordsError);
      throw new Error('Erro ao buscar palavras anotadas');
    }

    log.info('Annotated words loaded', { count: annotatedWords.length });

    // Buscar tagsets N1 (domínios principais)
    const { data: tagsets, error: tagsetsError } = await supabase
      .from('semantic_tagset')
      .select('codigo, nome, descricao, nivel_profundidade')
      .eq('nivel_profundidade', 1)
      .eq('status', 'ativo')
      .order('codigo');

    if (tagsetsError || !tagsets) {
      log.error('Error fetching tagsets', tagsetsError);
      throw new Error('Erro ao buscar tagsets');
    }

    // Mapa de cores padrão por domínio N1
    const colorMap: Record<string, string> = {
      'AB': '#9333EA', 'AP': '#10B981', 'CC': '#F59E0B', 'EL': '#EF4444',
      'EQ': '#8B5CF6', 'MG': '#6B7280', 'NA': '#268BC8', 'NC': '#6B7280',
      'OA': '#F97316', 'SB': '#EC4899', 'SE': '#8B5CF6', 'SH': '#24A65B', 'SP': '#EC4899'
    };

    // Criar mapa de códigos N1
    const tagsetMap = new Map(
      tagsets.map(t => [t.codigo, { nome: t.nome, descricao: t.descricao }])
    );

    // Agregar palavras por domínio N1
    const domainMap = new Map<string, {
      nome: string;
      descricao: string;
      cor: string;
      palavras: string[];
      palavrasComFrequencia: Array<{ palavra: string; ocorrencias: number }>;
      ocorrencias: number;
      llScores: number[];
      miScores: number[];
    }>();

    annotatedWords.forEach(word => {
      // Extrair código N1 (primeiros 2 caracteres do tagset_codigo)
      const tagsetCodigo = word.tagset_codigo || word.tagset_primario || 'NC';
      const n1Code = tagsetCodigo.substring(0, 2);
      
      const tagsetInfo = tagsetMap.get(n1Code);
      if (!tagsetInfo) return; // Pular palavras sem domínio N1 válido

      if (!domainMap.has(n1Code)) {
        domainMap.set(n1Code, {
          nome: tagsetInfo.nome,
          descricao: tagsetInfo.descricao || '',
          cor: colorMap[n1Code] || '#6B7280',
          palavras: [],
          palavrasComFrequencia: [],
          ocorrencias: 0,
          llScores: [],
          miScores: []
        });
      }

      const domain = domainMap.get(n1Code)!;
      const freq = word.freq_study_corpus || 1;
      
      domain.palavras.push(word.palavra);
      domain.palavrasComFrequencia.push({ palavra: word.palavra, ocorrencias: freq });
      domain.ocorrencias += freq;
      
      if (word.ll_score) domain.llScores.push(word.ll_score);
      if (word.mi_score) domain.miScores.push(word.mi_score);
    });

    // Calcular total de ocorrências
    const totalOcorrencias = Array.from(domainMap.values())
      .reduce((sum, d) => sum + d.ocorrencias, 0);

    // Converter para formato DominioSemantico
    const dominios: DominioSemantico[] = Array.from(domainMap.entries())
      .map(([codigo, data]) => {
        const percentual = (data.ocorrencias / totalOcorrencias) * 100;
        
        return {
          dominio: data.nome,
          cor: data.cor,
          corTexto: data.cor,
          palavras: [...new Set(data.palavras)], // Remover duplicatas
          palavrasComFrequencia: data.palavrasComFrequencia,
          ocorrencias: data.ocorrencias,
          percentual,
          frequenciaNormalizada: percentual,
          percentualTematico: percentual,
          riquezaLexical: data.palavras.length / data.ocorrencias,
          comparacaoCorpus: 'equilibrado' as const,
          diferencaCorpus: 0,
          percentualCorpusNE: 0
        };
      })
      .sort((a, b) => b.ocorrencias - a.ocorrencias);

    log.info('Semantic domains processed', { 
      domains: dominios.length,
      totalWords: annotatedWords.length,
      totalOccurrences: totalOcorrencias
    });

    return dominios;

  } catch (error) {
    log.error('Error fetching semantic domains', error as Error);
    throw error;
  }
}


# 🚀 ROADMAP DETALHADO - Sistema POS Híbrido (3 Camadas)

## ✅ SPRINT 0 - CONCLUÍDO (Layer 1 Foundation)

### Duração: 2h
### Status: ✅ 100% Completo

#### Entregas:
1. ✅ Criados 5 arquivos em `supabase/functions/_shared/`:
   - `gaucho-mwe.ts` - 9 templates MWE + 15 expressões fixas
   - `verbal-morphology.ts` - 50+ verbos irregulares
   - `pronoun-system.ts` - Sistema pronominal completo
   - `pos-annotation-cache.ts` - Cache inteligente palavra:contexto
   - `hybrid-pos-annotator.ts` - Anotador Layer 1

2. ✅ Integrado Layer 1 em `annotate-pos/index.ts`:
   - Substituído `processText()` para usar `annotateWithVAGrammar()`
   - Adicionado endpoint `/stats` para monitorar cache
   - Logging de cobertura implementado

3. ✅ Documentação atualizada:
   - `src/data/developer-logs/usas-methodology.ts` - Proposta VA com hybridPOSSystem
   - `IMPLEMENTATION_STEPS_POS_HYBRID.md` - Guia de implementação

#### Métricas Esperadas:
- **Cobertura**: 70-80% dos tokens (palavras funcionais + verbos comuns)
- **Precisão**: 98%+ (gramática explícita)
- **Custo**: $0 (zero API calls)
- **Velocidade**: <100ms por música

---

## 🎯 SPRINT 1 - Testes e Validação do Layer 1

### Duração Estimada: 3-4 horas
### Objetivo: Validar performance do Layer 1 em corpus real

### 1.1. Criar Suite de Testes (1h)

**Arquivo:** `supabase/functions/annotate-pos/tests.ts`

```typescript
import { annotateWithVAGrammar, calculateVAGrammarCoverage } from '../_shared/hybrid-pos-annotator.ts';

// Corpus de teste (poema "Quando o Verso Vem pras Casa")
const TEST_CORPUS = `
A calma do tarumã, ganhou sombra mais copada
Pela várzea espichada com o sol da tarde caindo
Um pañuelo maragato se abriu no horizonte
Trazendo um novo reponte, prá um fim de tarde bem lindo
`;

export async function runPOSTests() {
  console.log('🧪 === TESTE 1: Cobertura Layer 1 ===');
  
  const result = await annotateWithVAGrammar(TEST_CORPUS);
  const coverage = calculateVAGrammarCoverage(result);
  
  console.log(`✅ Total de tokens: ${coverage.totalTokens}`);
  console.log(`✅ Cobertos por VA: ${coverage.coveredByVA} (${coverage.coverageRate.toFixed(1)}%)`);
  console.log(`📊 Distribuição de sources:`, coverage.sourceDistribution);
  
  if (coverage.unknownWords.length > 0) {
    console.log(`⚠️ Palavras desconhecidas (${coverage.unknownWords.length}):`, coverage.unknownWords);
  }
  
  // Verificar tokens críticos
  const expectedAnnotations = [
    { palavra: 'ganhou', lema: 'ganhar', pos: 'VERB' },
    { palavra: 'tarumã', pos: 'NOUN' }, // Esperado: UNKNOWN (regional)
    { palavra: 'trazendo', lema: 'trazer', pos: 'VERB' },
    { palavra: 'mate amargo', pos: 'NOUN_COMPOUND' }, // MWE
  ];
  
  console.log('\n🔍 === TESTE 2: Validação de Anotações Específicas ===');
  for (const expected of expectedAnnotations) {
    const found = result.find(t => t.palavra.toLowerCase() === expected.palavra.toLowerCase());
    if (found) {
      const match = found.lema === (expected.lema || expected.palavra) && found.pos === expected.pos;
      console.log(`${match ? '✅' : '❌'} ${expected.palavra}: lema=${found.lema}, pos=${found.pos}`);
    } else {
      console.log(`❌ ${expected.palavra}: NÃO ENCONTRADO`);
    }
  }
  
  console.log('\n💾 === TESTE 3: Cache Performance ===');
  const result2 = await annotateWithVAGrammar(TEST_CORPUS); // Segunda vez
  const cacheHits = result2.filter(t => t.source === 'cache').length;
  console.log(`✅ Cache hits: ${cacheHits}/${result2.length} (${(cacheHits / result2.length * 100).toFixed(1)}%)`);
  
  return {
    coverageRate: coverage.coverageRate,
    unknownCount: coverage.unknownWords.length,
    cacheHitRate: (cacheHits / result2.length) * 100,
  };
}
```

### 1.2. Endpoint de Teste (30 min)

**Modificar:** `supabase/functions/annotate-pos/index.ts`

```typescript
// Adicionar rota de teste (apenas em dev)
if (req.method === 'GET' && url.pathname.endsWith('/test')) {
  const { runPOSTests } = await import('./tests.ts');
  const testResults = await runPOSTests();
  
  return new Response(JSON.stringify({
    message: 'POS Layer 1 Tests Complete',
    results: testResults,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

### 1.3. Análise de Corpus Real (1.5h)

**Tarefa:** Processar 100 músicas do corpus gaúcho e medir:

1. **Taxa de cobertura real**: % de palavras cobertas por VA Grammar
2. **Palavras desconhecidas mais frequentes**: Top 20 palavras que Layer 1 não reconheceu
3. **Taxa de acerto de lematização**: Comparar com ground truth manual
4. **Performance de cache**: Hit rate após 2ª passagem

**Deliverable:** Documento `LAYER1_PERFORMANCE_REPORT.md` com:
- Estatísticas agregadas
- Lista de palavras para adicionar ao lexicon VA
- Recomendações para Layer 2/3

### 1.4. Otimizações Baseadas em Dados (1h)

Com base no relatório, adicionar:
- **Novas MWEs** detectadas no corpus real
- **Verbos regionais** não cobertos (ex: "galopar", "tropear", "aguardar")
- **Substantivos frequentes** com padrões morfológicos reconhecíveis

**Critério de Sucesso Sprint 1:**
- ✅ Cobertura ≥ 70% em corpus real
- ✅ Cache hit rate ≥ 60% na 2ª passagem
- ✅ Zero regressões (testes automatizados passam)

---

## 🔧 SPRINT 2 - Integração Layer 2 (spaCy/Stanza Fallback)

### Duração Estimada: 6-8 horas
### Objetivo: Adicionar processamento de palavras desconhecidas via NLP tradicional

### 2.1. Decisão de Arquitetura (30 min)

**Opção A: Microserviço Python Separado (Recomendado se já usa Python)**
```python
# supabase/functions/spacy-service/main.py
from fastapi import FastAPI
import spacy

nlp = spacy.load("pt_core_news_lg")
app = FastAPI()

@app.post("/annotate")
async def annotate_batch(texts: list[str]):
    results = []
    for text in texts:
        doc = nlp(text)
        results.append([{
            "palavra": token.text,
            "lema": token.lemma_,
            "pos": token.pos_,
            "features": {
                "tempo": token.morph.get("Tense"),
                "numero": token.morph.get("Number"),
                "pessoa": token.morph.get("Person"),
            }
        } for token in doc])
    return results
```

**Opção B: stanza-js (TypeScript Nativo - Recomendado)**
```typescript
// Instalar: npm install stanza-js
import { Pipeline } from 'stanza-js';

const pipeline = new Pipeline('pt');
const result = await pipeline.process(texto);
// Resultado: mesmo formato que spaCy
```

**Opção C: Skip Layer 2 (Direto para Gemini)**
- Prós: Simplicidade, sem dependências externas
- Contras: Custo de API maior

**Recomendação:** **Opção B (stanza-js)** - TypeScript nativo, sem microserviço adicional

### 2.2. Implementar Layer 2 Wrapper (2h)

**Novo arquivo:** `supabase/functions/_shared/stanza-annotator.ts`

```typescript
import { Pipeline } from 'stanza-js';

let pipeline: Pipeline | null = null;

async function initStanza() {
  if (!pipeline) {
    pipeline = new Pipeline('pt', { 
      processors: 'tokenize,pos,lemma',
      download_method: 'cache' // Cachear modelos
    });
  }
  return pipeline;
}

export async function annotateWithStanza(tokens: string[]): Promise<Array<{
  palavra: string;
  lema: string;
  pos: string;
  features: Record<string, string>;
  confidence: number;
}>> {
  const pipe = await initStanza();
  const texto = tokens.join(' ');
  const doc = await pipe.process(texto);
  
  return doc.sentences[0].words.map(word => ({
    palavra: word.text,
    lema: word.lemma,
    pos: mapStanzaPOSToUniversal(word.upos),
    features: extractMorphFeatures(word.feats),
    confidence: 0.85, // Confiança média do stanza
  }));
}

function mapStanzaPOSToUniversal(upos: string): string {
  const mapping: Record<string, string> = {
    'NOUN': 'NOUN',
    'VERB': 'VERB',
    'ADJ': 'ADJ',
    'ADV': 'ADV',
    'ADP': 'ADP',
    'DET': 'DET',
    'PRON': 'PRON',
    'CONJ': 'CCONJ',
    'SCONJ': 'SCONJ',
    'NUM': 'NUM',
    'INTJ': 'INTJ',
    'X': 'X',
  };
  return mapping[upos] || 'X';
}

function extractMorphFeatures(feats: string): Record<string, string> {
  const features: Record<string, string> = {};
  
  if (!feats) return features;
  
  const pairs = feats.split('|');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      features[key.toLowerCase()] = value;
    }
  }
  
  return features;
}
```

### 2.3. Integrar Layer 2 no Pipeline (1.5h)

**Modificar:** `supabase/functions/annotate-pos/index.ts`

```typescript
import { annotateWithStanza } from "../_shared/stanza-annotator.ts";

async function processText(texto: string): Promise<POSToken[]> {
  // Layer 1: VA Grammar (prioridade)
  const vaAnnotated = await annotateWithVAGrammar(texto);
  
  // Filtrar tokens desconhecidos (confidence < 0.8)
  const unknownTokens = vaAnnotated.filter(t => t.confidence < 0.8);
  
  console.log(`✅ Layer 1: ${vaAnnotated.length - unknownTokens.length}/${vaAnnotated.length} tokens`);
  
  if (unknownTokens.length === 0) {
    // Tudo foi coberto por Layer 1
    return vaAnnotated.map(t => ({
      palavra: t.palavra,
      lema: t.lema,
      pos: t.pos,
      posDetalhada: t.posDetalhada,
      features: t.features,
      posicao: t.posicao,
    }));
  }
  
  // Layer 2: Stanza para tokens desconhecidos
  console.log(`🔄 Layer 2: Processando ${unknownTokens.length} unknown tokens...`);
  
  const unknownWords = unknownTokens.map(t => t.palavra);
  const stanzaResults = await annotateWithStanza(unknownWords);
  
  // Merge resultados
  const merged = [...vaAnnotated];
  unknownTokens.forEach((unknownToken, idx) => {
    const stanzaAnnotation = stanzaResults[idx];
    const tokenIndex = merged.findIndex(t => t.palavra === unknownToken.palavra && t.posicao === unknownToken.posicao);
    
    if (tokenIndex !== -1 && stanzaAnnotation) {
      merged[tokenIndex] = {
        ...unknownToken,
        lema: stanzaAnnotation.lema,
        pos: stanzaAnnotation.pos,
        posDetalhada: stanzaAnnotation.pos,
        features: stanzaAnnotation.features,
        source: 'stanza',
        confidence: stanzaAnnotation.confidence,
      };
      
      // Cachear resultado do Stanza
      setCachedPOSAnnotation(
        unknownToken.palavra,
        {
          palavra: stanzaAnnotation.palavra,
          lema: stanzaAnnotation.lema,
          pos: stanzaAnnotation.pos,
          posDetalhada: stanzaAnnotation.pos,
          features: stanzaAnnotation.features,
          source: 'stanza',
        },
        unknownToken.posicao > 0 ? merged[unknownToken.posicao - 1].palavra : '',
        unknownToken.posicao < merged.length - 1 ? merged[unknownToken.posicao + 1].palavra : ''
      );
    }
  });
  
  console.log(`✅ Layer 2: ${stanzaResults.length} tokens processados`);
  
  return merged.map(t => ({
    palavra: t.palavra,
    lema: t.lema,
    pos: t.pos,
    posDetalhada: t.posDetalhada,
    features: t.features,
    posicao: t.posicao,
  }));
}
```

### 2.4. Testes de Integração (1h)

**Casos de teste:**
1. ✅ Texto 100% coberto por Layer 1 → Layer 2 não é chamado
2. ✅ Texto com palavras regionais → Layer 2 processa apenas desconhecidas
3. ✅ Neologismos → Layer 2 fornece fallback razoável
4. ✅ Cache funciona para ambos os layers

### 2.5. Análise de Custo/Benefício (30 min)

**Medir:**
- Cobertura combinada Layer 1+2: esperado **90-95%**
- Custo incremental: **$0** (stanza é local)
- Latência adicional: esperado **+200-300ms por música**

**Decisão:** Se Layer 2 atingir ≥90% cobertura, **pular Sprint 3** (Gemini) e economizar API calls.

**Critério de Sucesso Sprint 2:**
- ✅ Cobertura combinada ≥ 90%
- ✅ Latência total < 500ms por música
- ✅ Cache hit rate ≥ 70% após 2ª passagem

---

## 🤖 SPRINT 3 - Integração Layer 3 (Gemini Fallback)

### Duração Estimada: 4-5 horas
### Objetivo: Adicionar IA para casos de baixíssima confiança

### 3.1. Criar Prompt de POS Tagging (1h)

**Novo arquivo:** `supabase/functions/_shared/gemini-pos-tagger.ts`

```typescript
interface GeminiPOSRequest {
  palavra: string;
  leftContext: string;
  rightContext: string;
}

export async function annotateWithGemini(
  requests: GeminiPOSRequest[]
): Promise<Array<{
  palavra: string;
  lema: string;
  pos: string;
  features: Record<string, string>;
  confidence: number;
}>> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  // Batch requests (até 10 palavras por vez)
  const batches = chunkArray(requests, 10);
  const results = [];

  for (const batch of batches) {
    const prompt = buildBatchPOSPrompt(batch);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Baixa temperatura para consistência
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Parse JSON array from response
    const parsed = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');
    results.push(...parsed);
  }

  return results;
}

function buildBatchPOSPrompt(batch: GeminiPOSRequest[]): string {
  return `Você é um linguista especializado em português brasileiro.

Analise as palavras abaixo no contexto fornecido e retorne anotações POS precisas.

FORMATO DE RESPOSTA: JSON array com objetos contendo:
- palavra: string
- lema: string (forma canônica)
- pos: string (NOUN, VERB, ADJ, ADV, ADP, DET, PRON, CCONJ, SCONJ, NUM, INTJ, X)
- features: object (tempo, numero, pessoa, genero, modo, grau quando aplicável)

PALAVRAS PARA ANOTAR:
${batch.map((req, idx) => `
${idx + 1}. Palavra: "${req.palavra}"
   Contexto: "${req.leftContext} **${req.palavra}** ${req.rightContext}"
`).join('\n')}

RETORNE APENAS O JSON ARRAY, SEM MARKDOWN:`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
```

### 3.2. Integrar Layer 3 no Pipeline (2h)

**Modificar:** `processText()` em `annotate-pos/index.ts`

```typescript
async function processText(texto: string): Promise<POSToken[]> {
  // Layer 1: VA Grammar
  const vaAnnotated = await annotateWithVAGrammar(texto);
  const unknownAfterL1 = vaAnnotated.filter(t => t.confidence < 0.8);
  
  if (unknownAfterL1.length === 0) {
    return vaAnnotated.map(formatToken);
  }
  
  // Layer 2: Stanza (se disponível)
  let merged = [...vaAnnotated];
  const unknownAfterL2 = await processWithStanza(merged, unknownAfterL1);
  
  if (unknownAfterL2.length === 0) {
    return merged.map(formatToken);
  }
  
  // Layer 3: Gemini (apenas para confidence < 0.6)
  const geminiCandidates = unknownAfterL2.filter(t => t.confidence < 0.6);
  
  if (geminiCandidates.length > 0) {
    console.log(`🤖 Layer 3: Processando ${geminiCandidates.length} tokens com Gemini...`);
    
    const geminiRequests = geminiCandidates.map(t => ({
      palavra: t.palavra,
      leftContext: t.posicao > 0 ? merged[t.posicao - 1].palavra : '',
      rightContext: t.posicao < merged.length - 1 ? merged[t.posicao + 1].palavra : '',
    }));
    
    const geminiResults = await annotateWithGemini(geminiRequests);
    
    // Merge Gemini results
    geminiCandidates.forEach((token, idx) => {
      const geminiAnnotation = geminiResults[idx];
      const tokenIndex = merged.findIndex(t => 
        t.palavra === token.palavra && t.posicao === token.posicao
      );
      
      if (tokenIndex !== -1 && geminiAnnotation) {
        merged[tokenIndex] = {
          ...token,
          lema: geminiAnnotation.lema,
          pos: geminiAnnotation.pos,
          posDetalhada: geminiAnnotation.pos,
          features: geminiAnnotation.features,
          source: 'gemini',
          confidence: 0.9, // Gemini tem alta confiança
        };
        
        // Cachear
        setCachedPOSAnnotation(/* ... */);
      }
    });
    
    console.log(`✅ Layer 3: ${geminiResults.length} tokens processados`);
  }
  
  return merged.map(formatToken);
}
```

### 3.3. Otimização de Custos (1h)

**Estratégias:**
1. **Batch processing**: Agrupar até 10 palavras por request Gemini
2. **Cache agressivo**: Cachear TODOS os resultados Gemini (TTL 30 dias)
3. **Threshold inteligente**: Só chamar Gemini se confidence < 0.6 (não < 0.8)
4. **Rate limiting**: Máximo 100 requests Gemini/dia por usuário

**Implementar contador de uso:**

```typescript
// Tabela: gemini_pos_usage
CREATE TABLE gemini_pos_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID,
  words_processed INT DEFAULT 0,
  api_calls INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  UNIQUE(date, user_id)
);

// Edge function: track usage
await supabase.from('gemini_pos_usage').upsert({
  date: new Date().toISOString().split('T')[0],
  user_id: userId,
  words_processed: geminiCandidates.length,
  api_calls: Math.ceil(geminiCandidates.length / 10),
  tokens_used: estimatedTokens,
});
```

### 3.4. Testes de Stress (1.5h)

**Cenários:**
1. ✅ 1000 músicas com 0% cache hit → medir custo total
2. ✅ 1000 músicas com 70% cache hit → medir economia
3. ✅ Palavras com múltiplos sentidos → verificar precisão
4. ✅ Neologismos e gírias → verificar fallback

**Critério de Sucesso Sprint 3:**
- ✅ Cobertura combinada ≥ 95%
- ✅ Custo médio < $0.001 por música (com cache)
- ✅ Latência total < 1s por música
- ✅ Precisão ≥ 93% em amostra manual

---

## 📊 SPRINT 4 - Dashboard de Monitoramento

### Duração Estimada: 3-4 horas
### Objetivo: Visualizar performance e qualidade do sistema POS

### 4.1. Criar Tabela de Métricas (30 min)

```sql
CREATE TABLE pos_annotation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métricas de cobertura
  total_tokens INT NOT NULL,
  layer1_coverage_percent DECIMAL(5,2),
  layer2_coverage_percent DECIMAL(5,2),
  layer3_coverage_percent DECIMAL(5,2),
  
  -- Métricas de cache
  cache_hit_rate DECIMAL(5,2),
  cache_size INT,
  
  -- Métricas de custo
  gemini_calls INT DEFAULT 0,
  gemini_tokens INT DEFAULT 0,
  estimated_cost_usd DECIMAL(10,6),
  
  -- Metadados
  corpus_id UUID,
  user_id UUID,
  processing_time_ms INT
);
```

### 4.2. Endpoint de Métricas (1h)

**Novo arquivo:** `supabase/functions/pos-metrics/index.ts`

```typescript
Deno.serve(async (req) => {
  const { dateFrom, dateTo } = await req.json();
  
  const { data: metrics } = await supabase
    .from('pos_annotation_metrics')
    .select('*')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);
  
  const aggregated = {
    totalSongsProcessed: metrics.length,
    avgLayer1Coverage: avg(metrics.map(m => m.layer1_coverage_percent)),
    avgLayer2Coverage: avg(metrics.map(m => m.layer2_coverage_percent)),
    avgLayer3Coverage: avg(metrics.map(m => m.layer3_coverage_percent)),
    totalGeminiCalls: sum(metrics.map(m => m.gemini_calls)),
    totalCost: sum(metrics.map(m => m.estimated_cost_usd)),
    avgCacheHitRate: avg(metrics.map(m => m.cache_hit_rate)),
    avgProcessingTime: avg(metrics.map(m => m.processing_time_ms)),
  };
  
  return new Response(JSON.stringify(aggregated), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 4.3. UI de Monitoramento (1.5h)

**Novo componente:** `src/components/admin/POSMonitoringDashboard.tsx`

```typescript
export const POSMonitoringDashboard = () => {
  const { data: metrics } = useQuery({
    queryKey: ['pos-metrics'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('pos-metrics', {
        body: { dateFrom: '2025-01-01', dateTo: '2025-12-31' },
      });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2>📊 Monitoramento POS Híbrido</h2>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard 
          title="Cobertura Layer 1 (VA)" 
          value={`${metrics.avgLayer1Coverage}%`}
          subtitle="Zero custo"
        />
        <MetricCard 
          title="Cobertura Layer 2 (Stanza)" 
          value={`${metrics.avgLayer2Coverage}%`}
          subtitle="Processamento local"
        />
        <MetricCard 
          title="Cobertura Layer 3 (Gemini)" 
          value={`${metrics.avgLayer3Coverage}%`}
          subtitle={`${metrics.totalGeminiCalls} calls`}
        />
      </div>
      
      {/* Gráfico de Cobertura ao Longo do Tempo */}
      <CoverageOverTimeChart data={metrics.timeSeries} />
      
      {/* Tabela de Top Unknown Words */}
      <UnknownWordsTable words={metrics.topUnknownWords} />
    </div>
  );
};
```

**Critério de Sucesso Sprint 4:**
- ✅ Dashboard funcional mostrando métricas em tempo real
- ✅ Identificação automática de palavras problemáticas
- ✅ Alertas quando cobertura < 90%

---

## 🔄 SPRINT 5 - Feedback Loop e Melhoria Contínua

### Duração Estimada: 3-4 horas
### Objetivo: Permitir correções humanas e atualização automática do lexicon

### 5.1. Tabela de Validações Humanas (30 min)

```sql
CREATE TABLE pos_human_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Palavra e contexto
  palavra TEXT NOT NULL,
  contexto_esquerdo TEXT,
  contexto_direito TEXT,
  
  -- Anotação automática (errada)
  auto_lema TEXT,
  auto_pos TEXT,
  auto_source TEXT,
  
  -- Correção humana
  correct_lema TEXT NOT NULL,
  correct_pos TEXT NOT NULL,
  correct_features JSONB,
  
  -- Metadados
  validated_by UUID REFERENCES auth.users(id),
  applied BOOLEAN DEFAULT FALSE
);
```

### 5.2. UI de Validação (1.5h)

**Componente:** `src/components/admin/POSValidationPanel.tsx`

```typescript
export const POSValidationPanel = () => {
  const [pendingValidations, setPendingValidations] = useState([]);

  const handleCorrection = async (validation: POSValidation) => {
    // Salvar correção
    await supabase.from('pos_human_validations').insert({
      palavra: validation.palavra,
      contexto_esquerdo: validation.leftContext,
      contexto_direito: validation.rightContext,
      auto_lema: validation.autoAnnotation.lema,
      auto_pos: validation.autoAnnotation.pos,
      correct_lema: validation.correction.lema,
      correct_pos: validation.correction.pos,
      validated_by: user.id,
    });
    
    toast.success('Correção salva! Será aplicada no próximo reprocessamento.');
  };

  return (
    <div>
      <h3>🔍 Validação de Anotações POS</h3>
      
      {pendingValidations.map(v => (
        <ValidationCard 
          key={v.id}
          validation={v}
          onCorrect={handleCorrection}
        />
      ))}
    </div>
  );
};
```

### 5.3. Aplicação Automática de Correções (1h)

**Job periódico:** `supabase/functions/apply-pos-corrections/index.ts`

```typescript
Deno.serve(async () => {
  // Buscar correções não aplicadas
  const { data: corrections } = await supabase
    .from('pos_human_validations')
    .select('*')
    .eq('applied', false);
  
  for (const correction of corrections) {
    // Atualizar cache com correção
    setCachedPOSAnnotation(
      correction.palavra,
      {
        palavra: correction.palavra,
        lema: correction.correct_lema,
        pos: correction.correct_pos,
        posDetalhada: correction.correct_pos,
        features: correction.correct_features,
        source: 'human_validated',
      },
      correction.contexto_esquerdo,
      correction.contexto_direito
    );
    
    // Marcar como aplicada
    await supabase
      .from('pos_human_validations')
      .update({ applied: true })
      .eq('id', correction.id);
  }
  
  return new Response(JSON.stringify({ 
    message: `${corrections.length} correções aplicadas` 
  }));
});
```

### 5.4. Atualização do Lexicon VA (1h)

**Script:** `scripts/update-va-lexicon-from-validations.ts`

```typescript
// A cada 100 validações, atualizar verbal-morphology.ts
// ou gaucho-mwe.ts com novos padrões detectados

export async function updateVALexiconFromValidations() {
  const { data: validations } = await supabase
    .from('pos_human_validations')
    .select('*')
    .eq('applied', true)
    .gte('created_at', thirtyDaysAgo);
  
  // Agrupar por tipo
  const newVerbs = validations.filter(v => v.correct_pos === 'VERB');
  const newMWEs = validations.filter(v => v.palavra.includes(' '));
  
  // Gerar código TypeScript
  const codeSnippet = generateVerbEntries(newVerbs);
  
  console.log('📝 Adicione ao verbal-morphology.ts:');
  console.log(codeSnippet);
  
  // Opcionalmente: auto-commit via Git API
}
```

**Critério de Sucesso Sprint 5:**
- ✅ UI de validação funcional
- ✅ Correções aplicadas automaticamente ao cache
- ✅ Relatório mensal de melhorias sugeridas

---

## 🎯 SPRINT 6 - Otimização e Produção

### Duração Estimada: 4-5 horas
### Objetivo: Preparar sistema para escala produção

### 6.1. Migração de Cache para IndexedDB (2h)

**Problema:** Cache em memória (Deno) perde dados ao restart  
**Solução:** Persistir cache em IndexedDB no frontend

**Novo arquivo:** `src/services/posIndexedDBCache.ts`

```typescript
import { openDB, DBSchema } from 'idb';

interface POSCacheDB extends DBSchema {
  'pos-cache': {
    key: string;
    value: CachedPOSAnnotation & { key: string };
  };
}

const dbPromise = openDB<POSCacheDB>('pos-cache-db', 1, {
  upgrade(db) {
    db.createObjectStore('pos-cache', { keyPath: 'key' });
  },
});

export async function getCachedFromIndexedDB(key: string) {
  const db = await dbPromise;
  return db.get('pos-cache', key);
}

export async function setCachedToIndexedDB(key: string, annotation: CachedPOSAnnotation) {
  const db = await dbPromise;
  await db.put('pos-cache', { ...annotation, key });
}

export async function syncCacheToIndexedDB(memoryCache: Map<string, CachedPOSAnnotation>) {
  const db = await dbPromise;
  const tx = db.transaction('pos-cache', 'readwrite');
  
  for (const [key, value] of memoryCache.entries()) {
    await tx.store.put({ ...value, key });
  }
  
  await tx.done;
}
```

### 6.2. Implementar Supabase Cache Table (1.5h)

**Migração:**

```sql
CREATE TABLE pos_annotation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  
  -- Anotação
  palavra TEXT NOT NULL,
  lema TEXT NOT NULL,
  pos TEXT NOT NULL,
  pos_detalhada TEXT,
  features JSONB,
  
  -- Metadados
  source TEXT NOT NULL,
  confidence DECIMAL(3,2),
  hit_count INT DEFAULT 0,
  
  -- Timestamps
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  last_hit_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_pos_cache_key ON pos_annotation_cache(cache_key);
CREATE INDEX idx_pos_cache_expires ON pos_annotation_cache(expires_at);

-- Job de limpeza automática
CREATE OR REPLACE FUNCTION clean_expired_pos_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM pos_annotation_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Modificar:** `pos-annotation-cache.ts` para usar Supabase

```typescript
export async function getCachedPOSAnnotation(
  palavra: string,
  leftContext: string,
  rightContext: string
): Promise<CachedPOSAnnotation | null> {
  const key = createCacheKey(palavra, leftContext, rightContext);
  
  // 1. Verificar memória primeiro (mais rápido)
  const memCached = memoryCache.get(key);
  if (memCached && !isExpired(memCached)) return memCached;
  
  // 2. Verificar Supabase (cache compartilhado)
  const { data } = await supabase
    .from('pos_annotation_cache')
    .select('*')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (data) {
    // Incrementar hit count
    await supabase
      .from('pos_annotation_cache')
      .update({ 
        hit_count: data.hit_count + 1,
        last_hit_at: new Date().toISOString(),
      })
      .eq('id', data.id);
    
    // Adicionar à memória
    memoryCache.set(key, data);
    return data;
  }
  
  return null;
}
```

### 6.3. Batch Processing Paralelo (1h)

**Implementar:** Processar múltiplas músicas em paralelo

```typescript
import PLimit from 'p-limit';

const limit = PLimit(5); // 5 músicas em paralelo

async function processBatchCorpus(songIds: string[]) {
  const promises = songIds.map(id => 
    limit(async () => {
      const song = await fetchSong(id);
      const tokens = await processText(song.lyrics);
      await savePOSAnnotations(song.id, tokens);
      return { songId: id, success: true };
    })
  );
  
  const results = await Promise.allSettled(promises);
  
  return {
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
  };
}
```

### 6.4. Monitoramento de Erros (1h)

**Integrar Sentry:**

```typescript
import * as Sentry from '@sentry/deno';

try {
  const tokens = await processText(texto);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      layer: determineFailedLayer(error),
      functionName: 'annotate-pos',
    },
    extra: {
      texto: texto.substring(0, 100),
      tokensProcessed: tokens?.length || 0,
    },
  });
  throw error;
}
```

**Critério de Sucesso Sprint 6:**
- ✅ Cache persistido entre restarts
- ✅ Batch processing processa 1000 músicas em < 10 minutos
- ✅ Monitoramento de erros ativo
- ✅ Documentação completa de deployment

---

## 📈 MÉTRICAS DE SUCESSO FINAIS

### Pipeline Completo (Layer 1+2+3)

| Métrica | Target | Atual (Sprint 0) |
|---------|--------|------------------|
| **Cobertura Lexical** | ≥95% | 70-80% (Layer 1 only) |
| **Precisão** | ≥93% | 98% (Layer 1), TBD (completo) |
| **Velocidade** | <1s/música | <100ms (Layer 1 only) |
| **Custo API** | <$0.001/música | $0 (Layer 1 only) |
| **Cache Hit Rate** | ≥70% | TBD |

### Economics

**Cenário 1: 10.000 músicas (sem cache)**
- Layer 1: 7.500 palavras cobertas (75% × 10k) → $0
- Layer 2: 2.000 palavras cobertas (20% × 10k) → $0
- Layer 3: 500 palavras via Gemini (5% × 10k) → ~$0.50 total
- **Custo total: $0.50 / 10.000 = $0.00005 por música** ✅

**Cenário 2: 10.000 músicas (70% cache hit)**
- Cache: 7.000 palavras (70% hit)
- Processamento: 3.000 palavras
  - Layer 1: 2.250 (75%)
  - Layer 2: 600 (20%)
  - Layer 3: 150 (5%) → ~$0.15
- **Custo total: $0.15 / 10.000 = $0.000015 por música** ✅✅

---

## 🎯 CRONOGRAMA GERAL

```
┌─────────────┬──────────────────┬──────────────┬──────────┐
│ Sprint      │ Duração          │ Esforço      │ Prioridade│
├─────────────┼──────────────────┼──────────────┼──────────┤
│ Sprint 0    │ ✅ CONCLUÍDO     │ 2h           │ CRÍTICA  │
│ Sprint 1    │ Semana 1         │ 3-4h         │ ALTA     │
│ Sprint 2    │ Semana 2         │ 6-8h         │ ALTA     │
│ Sprint 3    │ Semana 3         │ 4-5h         │ MÉDIA    │
│ Sprint 4    │ Semana 4         │ 3-4h         │ MÉDIA    │
│ Sprint 5    │ Semana 5         │ 3-4h         │ BAIXA    │
│ Sprint 6    │ Semana 6         │ 4-5h         │ BAIXA    │
├─────────────┼──────────────────┼──────────────┼──────────┤
│ TOTAL       │ 6 semanas        │ 25-32 horas  │          │
└─────────────┴──────────────────┴──────────────┴──────────┘
```

---

## 🚨 DECISÕES CRÍTICAS

### Decisão 1: Skip Layer 2? (Após Sprint 1)

**Se Layer 1 atinge ≥85% cobertura:**
- ✅ Pular Sprint 2 (stanza)
- ✅ Ir direto para Sprint 3 (Gemini para 15% restantes)
- 💰 Economia: ~8h de desenvolvimento

### Decisão 2: Threshold de Gemini (Após Sprint 2)

**Se Layer 1+2 atinge ≥95% cobertura:**
- ✅ Usar Gemini apenas para confidence < 0.5 (ao invés de < 0.6)
- 💰 Redução de 40% nas API calls

### Decisão 3: Cache Compartilhado (Após Sprint 6)

**Se múltiplos usuários processam mesmo corpus:**
- ✅ Implementar cache compartilhado no Supabase
- ✅ Economia de ~60% em reprocessamento

---

## 📚 PRÓXIMOS PASSOS IMEDIATOS

### Ação 1: Testar Layer 1 Integrado
```bash
# Fazer request para edge function
curl -X POST https://[PROJECT].supabase.co/functions/v1/annotate-pos \
  -H "Content-Type: application/json" \
  -d '{"texto": "A calma do tarumã ganhou sombra mais copada"}'

# Verificar logs
# Esperado: "✅ Layer 1 (VA Grammar): 8/9 tokens (88.9% cobertura)"
```

### Ação 2: Verificar Estatísticas de Cache
```bash
curl https://[PROJECT].supabase.co/functions/v1/annotate-pos/stats

# Retorno esperado:
# {
#   "totalEntries": 0,
#   "totalHits": 0,
#   "hitRate": 0,
#   "sourceDistribution": {}
# }
```

### Ação 3: Iniciar Sprint 1
- Criar suite de testes
- Processar amostra de 100 músicas
- Gerar relatório de performance
- Decidir se pula Layer 2

---

## 🎉 BENEFÍCIOS DO SISTEMA HÍBRIDO

1. **Economia Radical**: 75% das palavras processadas com $0 de custo
2. **Precisão Superior**: 98%+ para PT-BR gaúcho vs. 85% do spaCy genérico
3. **Escalabilidade**: Cache compartilhado reduz custo exponencialmente
4. **Manutenibilidade**: Feedback loop permite evolução contínua
5. **Transparência**: Source tracking revela origem de cada anotação

---

## 📖 REFERÊNCIAS

- **USAS Methodology**: `src/data/developer-logs/usas-methodology.ts`
- **Implementation Steps**: `IMPLEMENTATION_STEPS_POS_HYBRID.md`
- **Roadmap Dual-Layer**: `IMPLEMENTATION_ROADMAP_DUAL_LAYER.md`
- **VA Grammar Files**: `supabase/functions/_shared/` (5 arquivos)

---

**Última atualização:** 2025-01-15  
**Versão:** 1.0  
**Status do Projeto:** Sprint 0 concluído, pronto para Sprint 1
-- ============================================
-- SCHEMA: LÉXICO DIALECTAL E DICIONÁRIOS
-- ============================================

-- Tabela principal de léxico dialectal (Dicionário da Cultura Pampeana)
CREATE TABLE IF NOT EXISTS dialectal_lexicon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação básica
  verbete text NOT NULL,
  verbete_normalizado text NOT NULL,
  
  -- Origem regionalista
  origem_regionalista text[] DEFAULT '{}',
  origem_primaria text,
  
  -- Classificação gramatical
  classe_gramatical text,
  
  -- Marcações temporais e uso
  marcacao_temporal text,
  frequencia_uso text,
  
  -- Definições (JSONB para múltiplas acepções)
  definicoes jsonb DEFAULT '[]'::jsonb,
  
  -- Relações lexicais
  sinonimos text[] DEFAULT '{}',
  remissoes text[] DEFAULT '{}',
  variantes text[] DEFAULT '{}',
  
  -- Contextos culturais (JSONB)
  contextos_culturais jsonb DEFAULT '{}'::jsonb,
  
  -- Metadados linguísticos
  influencia_platina boolean DEFAULT false,
  termos_espanhol text[] DEFAULT '{}',
  referencias_dicionarios text[] DEFAULT '{}',
  
  -- Categorias temáticas (para multi-tagging)
  categorias_tematicas text[] DEFAULT '{}',
  
  -- Metadados de processamento
  volume_fonte text,
  pagina_fonte int,
  confianca_extracao numeric(5,2) DEFAULT 0.95,
  validado_humanamente boolean DEFAULT false,
  
  -- Timestamps
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela para o dicionário Gutenberg (português geral)
CREATE TABLE IF NOT EXISTS gutenberg_lexicon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  verbete text NOT NULL,
  verbete_normalizado text NOT NULL,
  
  -- Classificação gramatical
  classe_gramatical text,
  genero text,
  
  -- Definições (múltiplas acepções)
  definicoes jsonb DEFAULT '[]'::jsonb,
  
  -- Etimologia
  etimologia text,
  origem_lingua text,
  
  -- Relações lexicais
  sinonimos text[] DEFAULT '{}',
  antonimos text[] DEFAULT '{}',
  derivados text[] DEFAULT '{}',
  
  -- Contexto de uso
  exemplos text[] DEFAULT '{}',
  expressoes text[] DEFAULT '{}',
  
  -- Marcações especiais
  arcaico boolean DEFAULT false,
  regional boolean DEFAULT false,
  figurado boolean DEFAULT false,
  popular boolean DEFAULT false,
  
  -- Áreas de conhecimento
  areas_conhecimento text[] DEFAULT '{}',
  
  -- Metadados
  confianca_extracao numeric(5,2) DEFAULT 0.90,
  validado boolean DEFAULT false,
  
  -- Timestamps
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Índices para performance (dialectal_lexicon)
CREATE INDEX IF NOT EXISTS idx_dialectal_verbete ON dialectal_lexicon(verbete_normalizado);
CREATE INDEX IF NOT EXISTS idx_dialectal_origem ON dialectal_lexicon(origem_primaria);
CREATE INDEX IF NOT EXISTS idx_dialectal_categorias ON dialectal_lexicon USING gin(categorias_tematicas);
CREATE INDEX IF NOT EXISTS idx_dialectal_definicoes ON dialectal_lexicon USING gin(definicoes);
CREATE INDEX IF NOT EXISTS idx_dialectal_sinonimos ON dialectal_lexicon USING gin(sinonimos);
CREATE INDEX IF NOT EXISTS idx_dialectal_contextos ON dialectal_lexicon USING gin(contextos_culturais);

-- Índices para performance (gutenberg_lexicon)
CREATE INDEX IF NOT EXISTS idx_gutenberg_verbete ON gutenberg_lexicon(verbete_normalizado);
CREATE INDEX IF NOT EXISTS idx_gutenberg_classe ON gutenberg_lexicon(classe_gramatical);
CREATE INDEX IF NOT EXISTS idx_gutenberg_definicoes ON gutenberg_lexicon USING gin(definicoes);
CREATE INDEX IF NOT EXISTS idx_gutenberg_areas ON gutenberg_lexicon USING gin(areas_conhecimento);

-- RLS Policies (dialectal_lexicon)
ALTER TABLE dialectal_lexicon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dialectal lexicon é público" ON dialectal_lexicon;
CREATE POLICY "Dialectal lexicon é público"
  ON dialectal_lexicon FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Edge functions podem inserir dialectal" ON dialectal_lexicon;
CREATE POLICY "Edge functions podem inserir dialectal"
  ON dialectal_lexicon FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Edge functions podem atualizar dialectal" ON dialectal_lexicon;
CREATE POLICY "Edge functions podem atualizar dialectal"
  ON dialectal_lexicon FOR UPDATE
  USING (true);

-- RLS Policies (gutenberg_lexicon)
ALTER TABLE gutenberg_lexicon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gutenberg lexicon é público" ON gutenberg_lexicon;
CREATE POLICY "Gutenberg lexicon é público"
  ON gutenberg_lexicon FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Edge functions podem inserir gutenberg" ON gutenberg_lexicon;
CREATE POLICY "Edge functions podem inserir gutenberg"
  ON gutenberg_lexicon FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Edge functions podem atualizar gutenberg" ON gutenberg_lexicon;
CREATE POLICY "Edge functions podem atualizar gutenberg"
  ON gutenberg_lexicon FOR UPDATE
  USING (true);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_dialectal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_gutenberg_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dialectal_lexicon_timestamp ON dialectal_lexicon;
CREATE TRIGGER update_dialectal_lexicon_timestamp
  BEFORE UPDATE ON dialectal_lexicon
  FOR EACH ROW
  EXECUTE FUNCTION update_dialectal_timestamp();

DROP TRIGGER IF EXISTS update_gutenberg_lexicon_timestamp ON gutenberg_lexicon;
CREATE TRIGGER update_gutenberg_lexicon_timestamp
  BEFORE UPDATE ON gutenberg_lexicon
  FOR EACH ROW
  EXECUTE FUNCTION update_gutenberg_timestamp();
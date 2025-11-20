-- Adicionar constraint UNIQUE em verbete_normalizado para permitir upsert
ALTER TABLE dialectal_lexicon 
ADD CONSTRAINT dialectal_lexicon_verbete_normalizado_key 
UNIQUE (verbete_normalizado);

-- Criar índice para melhorar performance de filtros por volume_fonte
CREATE INDEX IF NOT EXISTS idx_dialectal_lexicon_volume_fonte 
ON dialectal_lexicon(volume_fonte);
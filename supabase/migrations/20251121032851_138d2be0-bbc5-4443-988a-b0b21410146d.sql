-- Adicionar coluna para rastrear edições manuais
ALTER TABLE dialectal_lexicon 
ADD COLUMN IF NOT EXISTS manually_edited BOOLEAN DEFAULT false;

-- Criar índice para filtrar editados manualmente
CREATE INDEX IF NOT EXISTS idx_dialectal_manually_edited 
ON dialectal_lexicon(manually_edited) 
WHERE manually_edited = true;

-- Adicionar comentário
COMMENT ON COLUMN dialectal_lexicon.manually_edited IS 'Flag para indicar se o verbete foi editado manualmente após extração automática';
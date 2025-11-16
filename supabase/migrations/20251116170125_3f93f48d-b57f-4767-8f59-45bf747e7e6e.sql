-- Remover foreign key constraints que impedem modo demo sem autenticação

-- Verificar e remover constraint de annotation_jobs
ALTER TABLE annotation_jobs 
DROP CONSTRAINT IF EXISTS annotation_jobs_user_id_fkey;

-- Verificar e remover constraint de human_validations
ALTER TABLE human_validations 
DROP CONSTRAINT IF EXISTS human_validations_user_id_fkey;

-- Verificar e remover constraint de semantic_tagset
ALTER TABLE semantic_tagset 
DROP CONSTRAINT IF EXISTS semantic_tagset_criado_por_fkey;

ALTER TABLE semantic_tagset 
DROP CONSTRAINT IF EXISTS semantic_tagset_aprovado_por_fkey;

-- Adicionar comentários para documentar
COMMENT ON COLUMN annotation_jobs.user_id IS 'DEMO MODE: Foreign key constraint removida para permitir testes sem autenticação';
COMMENT ON COLUMN human_validations.user_id IS 'DEMO MODE: Foreign key constraint removida para permitir testes sem autenticação';
COMMENT ON COLUMN semantic_tagset.criado_por IS 'DEMO MODE: Foreign key constraint removida para permitir testes sem autenticação';
COMMENT ON COLUMN semantic_tagset.aprovado_por IS 'DEMO MODE: Foreign key constraint removida para permitir testes sem autenticação';
-- Fase 1: Adicionar colunas de rastreamento de posição e proteção anti-duplicação
ALTER TABLE semantic_annotation_jobs 
ADD COLUMN IF NOT EXISTS current_song_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_word_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chunk_size INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS chunks_processed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_chunk_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para otimizar queries de verificação de duplicação
CREATE INDEX IF NOT EXISTS idx_semantic_jobs_last_chunk 
ON semantic_annotation_jobs(id, last_chunk_at) 
WHERE status IN ('iniciado', 'processando');
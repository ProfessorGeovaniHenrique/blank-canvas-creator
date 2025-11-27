-- Fase 1: Limpar cache com artist_id NULL (serão reprocessadas com UPSERT)
DELETE FROM semantic_disambiguation_cache WHERE artist_id IS NULL;

-- Fase 2: Resetar jobs ativos para reprocessar
UPDATE semantic_annotation_jobs 
SET status = 'processando',
    processed_words = 0, 
    cached_words = 0, 
    new_words = 0,
    current_song_index = 0, 
    current_word_index = 0,
    chunks_processed = 0, 
    last_chunk_at = NOW()
WHERE status IN ('processando', 'pausado', 'iniciado')
  AND artist_name = 'Luiz Marenco';
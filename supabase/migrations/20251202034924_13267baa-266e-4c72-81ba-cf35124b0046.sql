-- Limpar jobs órfãos do batch seeding
-- Jobs que estão "processando" mas sem atividade nos últimos 5 minutos

UPDATE batch_seeding_jobs 
SET 
  status = 'cancelado', 
  erro_mensagem = 'Job abandonado - sem atividade por mais de 5 minutos',
  tempo_fim = NOW(),
  updated_at = NOW()
WHERE status = 'processando' 
  AND (
    last_chunk_at IS NULL 
    OR last_chunk_at < NOW() - INTERVAL '5 minutes'
  )
  AND created_at < NOW() - INTERVAL '5 minutes';
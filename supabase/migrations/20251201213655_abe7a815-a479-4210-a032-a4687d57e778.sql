-- Cancelar job travado de batch seeding
UPDATE batch_seeding_jobs 
SET 
  status = 'cancelado',
  erro_mensagem = 'Cancelado manualmente - job travado sem atividade',
  tempo_fim = NOW(),
  updated_at = NOW()
WHERE id = 'a1b58253-ec32-4b07-b1d1-c958fcbb98db'
  AND status = 'processando';
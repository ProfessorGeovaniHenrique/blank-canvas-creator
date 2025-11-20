-- Reescrever cancel_job_atomic com lock não-bloqueante para prevenir statement timeouts
CREATE OR REPLACE FUNCTION public.cancel_job_atomic(
  p_job_id UUID,
  p_user_id UUID,
  p_reason TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  job_status TEXT,
  forced BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lock_acquired BOOLEAN;
  v_lock_hash BIGINT;
  v_current_status TEXT;
  v_wait_iterations INTEGER := 0;
  v_max_wait_iterations INTEGER := 20; -- 20 iterações de 0.5s = 10s total
BEGIN
  -- Criar hash do job_id para advisory lock
  v_lock_hash := ('x' || substr(md5(p_job_id::text), 1, 15))::bit(60)::bigint;
  
  -- ✅ NOVA ABORDAGEM: Tentar adquirir lock com polling não-bloqueante
  LOOP
    v_lock_acquired := pg_try_advisory_xact_lock(v_lock_hash);
    
    IF v_lock_acquired THEN
      EXIT; -- Lock adquirido, prosseguir
    END IF;
    
    v_wait_iterations := v_wait_iterations + 1;
    
    IF v_wait_iterations >= v_max_wait_iterations THEN
      -- Timeout: Não conseguiu lock após 10s
      RETURN QUERY SELECT 
        false,
        'timeout'::TEXT,
        false,
        'Timeout ao aguardar lock (job pode estar em transação longa)'::TEXT;
      RETURN;
    END IF;
    
    -- Aguardar 500ms antes de tentar novamente
    PERFORM pg_sleep(0.5);
  END LOOP;
  
  -- Lock adquirido: verificar status atual
  SELECT status INTO v_current_status
  FROM dictionary_import_jobs
  WHERE id = p_job_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::TEXT, false, 'Job não encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Não pode cancelar jobs já finalizados
  IF v_current_status IN ('concluido', 'erro', 'cancelado') THEN
    RETURN QUERY SELECT 
      false, 
      v_current_status, 
      false, 
      format('Job já está no status: %s', v_current_status)::TEXT;
    RETURN;
  END IF;
  
  -- ✅ CANCELAMENTO GRACEFUL
  UPDATE dictionary_import_jobs
  SET 
    status = 'cancelado',
    cancelled_at = NOW(),
    cancelled_by = p_user_id,
    cancellation_reason = p_reason,
    tempo_fim = NOW(),
    atualizado_em = NOW(),
    metadata = COALESCE(metadata, '{}'::jsonb) || 
               jsonb_build_object(
                 'cancelled_gracefully', true,
                 'cancelled_by_function', 'cancel_job_atomic_v2'
               )
  WHERE id = p_job_id;
  
  RETURN QUERY SELECT 
    true, 
    'cancelado'::TEXT, 
    false,
    'Job cancelado com sucesso (graceful shutdown)'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.cancel_job_atomic IS 
  'Versão melhorada com pg_try_advisory_xact_lock (non-blocking) e polling. 
   Tenta adquirir lock por até 10s antes de retornar timeout.
   Previne statement timeouts ao usar polling ativo ao invés de espera bloqueante.';
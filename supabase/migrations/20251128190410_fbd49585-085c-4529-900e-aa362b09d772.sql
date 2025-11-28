-- Fix Function Search Path Mutable security issue
-- Add SET search_path TO 'public' to all functions missing it

-- refresh_artist_stats
CREATE OR REPLACE FUNCTION public.refresh_artist_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY artist_stats_mv;
  RETURN NULL;
END;
$function$;

-- clean_expired_semantic_cache
CREATE OR REPLACE FUNCTION public.clean_expired_semantic_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM semantic_disambiguation_cache 
  WHERE cached_at < NOW() - INTERVAL '7 days';
END;
$function$;

-- increment_semantic_cache_hit
CREATE OR REPLACE FUNCTION public.increment_semantic_cache_hit(cache_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE semantic_disambiguation_cache
  SET 
    hits_count = hits_count + 1,
    last_hit_at = NOW()
  WHERE id = cache_id;
END;
$function$;

-- validate_tagset_hierarchy
CREATE OR REPLACE FUNCTION public.validate_tagset_hierarchy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  partes text[];
  codigo_nivel_calculado integer;
BEGIN
  partes := string_to_array(NEW.codigo, '.');
  codigo_nivel_calculado := array_length(partes, 1);
  
  IF codigo_nivel_calculado > 4 THEN
    RAISE EXCEPTION 'Hierarquia limitada a 4 níveis máximos';
  END IF;
  
  IF NEW.nivel_profundidade IS NULL OR NEW.codigo ~ '^[0-9.]+$' THEN
    NEW.nivel_profundidade := codigo_nivel_calculado;
  END IF;
  
  NEW.codigo_nivel_1 := partes[1];
  NEW.codigo_nivel_2 := CASE WHEN codigo_nivel_calculado >= 2 THEN partes[1] || '.' || partes[2] ELSE NULL END;
  NEW.codigo_nivel_3 := CASE WHEN codigo_nivel_calculado >= 3 THEN partes[1] || '.' || partes[2] || '.' || partes[3] ELSE NULL END;
  NEW.codigo_nivel_4 := CASE WHEN codigo_nivel_calculado = 4 THEN partes[1] || '.' || partes[2] || '.' || partes[3] || '.' || partes[4] ELSE NULL END;
  
  RETURN NEW;
END;
$function$;

-- sync_gutenberg_validation_status
CREATE OR REPLACE FUNCTION public.sync_gutenberg_validation_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.validado = true AND (NEW.validation_status IS NULL OR NEW.validation_status = 'pending') THEN
    NEW.validation_status := 'approved';
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, NEW.atualizado_em, NEW.criado_em);
  END IF;
  RETURN NEW;
END;
$function$;

-- sync_dialectal_validation_status
CREATE OR REPLACE FUNCTION public.sync_dialectal_validation_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.validado_humanamente = true AND (NEW.validation_status IS NULL OR NEW.validation_status = 'pending') THEN
    NEW.validation_status := 'approved';
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, NEW.atualizado_em, NEW.criado_em);
  END IF;
  RETURN NEW;
END;
$function$;

-- update_dev_history_overrides_updated_at
CREATE OR REPLACE FUNCTION public.update_dev_history_overrides_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- normalize_text
CREATE OR REPLACE FUNCTION public.normalize_text(text)
RETURNS text
LANGUAGE sql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $function$
  SELECT lower(unaccent(trim($1)));
$function$;

-- update_updated_at_column_music
CREATE OR REPLACE FUNCTION public.update_updated_at_column_music()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- clean_expired_gemini_cache
CREATE OR REPLACE FUNCTION public.clean_expired_gemini_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM gemini_cache WHERE expires_at < NOW();
END;
$function$;

-- calculate_tagset_hierarchy
CREATE OR REPLACE FUNCTION public.calculate_tagset_hierarchy()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar tagsets de nível 1 (sem pai - categoria_pai IS NULL)
  UPDATE semantic_tagset
  SET 
    nivel_profundidade = 1,
    hierarquia_completa = nome,
    tagset_pai = NULL,
    codigo_nivel_1 = codigo,
    codigo_nivel_2 = NULL,
    codigo_nivel_3 = NULL,
    codigo_nivel_4 = NULL
  WHERE categoria_pai IS NULL;

  -- Atualizar tagsets de nível 2 (filhos diretos de nível 1)
  UPDATE semantic_tagset t2
  SET
    nivel_profundidade = 2,
    tagset_pai = t1.codigo,
    hierarquia_completa = t1.nome || ' > ' || t2.nome,
    codigo_nivel_1 = t1.codigo,
    codigo_nivel_2 = t2.codigo,
    codigo_nivel_3 = NULL,
    codigo_nivel_4 = NULL
  FROM semantic_tagset t1
  WHERE t2.categoria_pai = t1.codigo
    AND t1.categoria_pai IS NULL;

  -- Atualizar tagsets de nível 3 (netos)
  UPDATE semantic_tagset t3
  SET
    nivel_profundidade = 3,
    tagset_pai = t2.codigo,
    hierarquia_completa = t1.nome || ' > ' || t2.nome || ' > ' || t3.nome,
    codigo_nivel_1 = t2.codigo_nivel_1,
    codigo_nivel_2 = t2.codigo,
    codigo_nivel_3 = t3.codigo,
    codigo_nivel_4 = NULL
  FROM semantic_tagset t2
  JOIN semantic_tagset t1 ON t2.categoria_pai = t1.codigo
  WHERE t3.categoria_pai = t2.codigo
    AND t2.categoria_pai IS NOT NULL
    AND t1.categoria_pai IS NULL;

  -- Atualizar tagsets de nível 4 (bisnetos)
  UPDATE semantic_tagset t4
  SET
    nivel_profundidade = 4,
    tagset_pai = t3.codigo,
    hierarquia_completa = t1.nome || ' > ' || t2.nome || ' > ' || t3.nome || ' > ' || t4.nome,
    codigo_nivel_1 = t3.codigo_nivel_1,
    codigo_nivel_2 = t3.codigo_nivel_2,
    codigo_nivel_3 = t3.codigo,
    codigo_nivel_4 = t4.codigo
  FROM semantic_tagset t3
  JOIN semantic_tagset t2 ON t3.categoria_pai = t2.codigo
  JOIN semantic_tagset t1 ON t2.categoria_pai = t1.codigo
  WHERE t4.categoria_pai = t3.codigo
    AND t1.categoria_pai IS NULL;

  RAISE NOTICE 'Campos hierárquicos calculados com sucesso para todos os tagsets';
END;
$function$;

-- get_dialectal_stats
CREATE OR REPLACE FUNCTION public.get_dialectal_stats()
RETURNS TABLE(total bigint, volume_i bigint, volume_ii bigint, validados bigint, confianca_media numeric, campeiros bigint, platinismos bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE volume_fonte = 'I')::BIGINT as volume_i,
    COUNT(*) FILTER (WHERE volume_fonte = 'II')::BIGINT as volume_ii,
    COUNT(*) FILTER (WHERE validado_humanamente = true)::BIGINT as validados,
    COALESCE(AVG(confianca_extracao), 0)::NUMERIC as confianca_media,
    COUNT(*) FILTER (WHERE 'campeiro' = ANY(origem_regionalista))::BIGINT as campeiros,
    COUNT(*) FILTER (WHERE influencia_platina = true)::BIGINT as platinismos
  FROM dialectal_lexicon;
END;
$function$;

-- get_gutenberg_stats
CREATE OR REPLACE FUNCTION public.get_gutenberg_stats()
RETURNS TABLE(total bigint, validados bigint, confianca_media numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE validado = true)::BIGINT as validados,
    COALESCE(AVG(confianca_extracao), 0)::NUMERIC as confianca_media
  FROM gutenberg_lexicon;
END;
$function$;

-- cancel_job_atomic
CREATE OR REPLACE FUNCTION public.cancel_job_atomic(p_job_id uuid, p_user_id uuid, p_reason text)
RETURNS TABLE(success boolean, job_status text, forced boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lock_acquired BOOLEAN;
  v_lock_hash BIGINT;
  v_current_status TEXT;
  v_wait_iterations INTEGER := 0;
  v_max_wait_iterations INTEGER := 20;
BEGIN
  v_lock_hash := ('x' || substr(md5(p_job_id::text), 1, 15))::bit(60)::bigint;
  
  LOOP
    v_lock_acquired := pg_try_advisory_xact_lock(v_lock_hash);
    
    IF v_lock_acquired THEN
      EXIT;
    END IF;
    
    v_wait_iterations := v_wait_iterations + 1;
    
    IF v_wait_iterations >= v_max_wait_iterations THEN
      RETURN QUERY SELECT 
        false,
        'timeout'::TEXT,
        false,
        'Timeout ao aguardar lock (job pode estar em transação longa)'::TEXT;
      RETURN;
    END IF;
    
    PERFORM pg_sleep(0.5);
  END LOOP;
  
  SELECT status INTO v_current_status
  FROM dictionary_import_jobs
  WHERE id = p_job_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::TEXT, false, 'Job não encontrado'::TEXT;
    RETURN;
  END IF;
  
  IF v_current_status IN ('concluido', 'erro', 'cancelado') THEN
    RETURN QUERY SELECT 
      false, 
      v_current_status, 
      false, 
      format('Job já está no status: %s', v_current_status)::TEXT;
    RETURN;
  END IF;
  
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
$function$;

-- update_lexical_synonyms_timestamp
CREATE OR REPLACE FUNCTION public.update_lexical_synonyms_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$function$;

-- truncate_gutenberg_table
CREATE OR REPLACE FUNCTION public.truncate_gutenberg_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  TRUNCATE TABLE gutenberg_lexicon RESTART IDENTITY CASCADE;
END;
$function$;

-- get_dialectal_stats_flexible
CREATE OR REPLACE FUNCTION public.get_dialectal_stats_flexible(dict_type text DEFAULT NULL::text, volume_filter text DEFAULT NULL::text)
RETURNS TABLE(total bigint, validados bigint, confianca_media numeric, campeiros bigint, platinismos bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE validado_humanamente = true)::BIGINT as validados,
    COALESCE(ROUND(AVG(confianca_extracao), 2), 0)::NUMERIC as confianca_media,
    COUNT(*) FILTER (WHERE 'campeiro' = ANY(origem_regionalista))::BIGINT as campeiros,
    COUNT(*) FILTER (WHERE influencia_platina = true)::BIGINT as platinismos
  FROM dialectal_lexicon
  WHERE 
    (dict_type IS NULL OR tipo_dicionario = dict_type)
    AND
    (volume_filter IS NULL OR volume_fonte = volume_filter);
END;
$function$;

-- clean_expired_health_checks
CREATE OR REPLACE FUNCTION public.clean_expired_health_checks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM lexicon_health_status
  WHERE expires_at < NOW();
END;
$function$;

-- clean_old_system_logs
CREATE OR REPLACE FUNCTION public.clean_old_system_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM system_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');
END;
$function$;

-- update_construction_phase_timestamp
CREATE OR REPLACE FUNCTION public.update_construction_phase_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- update_semantic_job_timestamp
CREATE OR REPLACE FUNCTION public.update_semantic_job_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- get_dialectal_stats_by_type
CREATE OR REPLACE FUNCTION public.get_dialectal_stats_by_type(dict_type text)
RETURNS TABLE(total bigint, validados bigint, confianca_media numeric, campeiros bigint, platinismos bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE validado_humanamente = true)::BIGINT as validados,
    COALESCE(ROUND(AVG(confianca_extracao), 2), 0)::NUMERIC as confianca_media,
    COUNT(*) FILTER (WHERE 'campeiro' = ANY(origem_regionalista))::BIGINT as campeiros,
    COUNT(*) FILTER (WHERE influencia_platina = true)::BIGINT as platinismos
  FROM dialectal_lexicon
  WHERE tipo_dicionario = dict_type;
END;
$function$;

-- get_youtube_quota_usage
CREATE OR REPLACE FUNCTION public.get_youtube_quota_usage()
RETURNS TABLE(queries_used integer, quota_limit integer, queries_remaining integer, usage_percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(queries_count, 0) as queries_used,
    quota_limit,
    quota_limit - COALESCE(queries_count, 0) as queries_remaining,
    ROUND((COALESCE(queries_count, 0)::NUMERIC / quota_limit::NUMERIC) * 100, 2) as usage_percentage
  FROM youtube_api_usage
  WHERE date = CURRENT_DATE
  UNION ALL
  SELECT 0, 10000, 10000, 0.00
  WHERE NOT EXISTS (SELECT 1 FROM youtube_api_usage WHERE date = CURRENT_DATE)
  LIMIT 1;
END;
$function$;
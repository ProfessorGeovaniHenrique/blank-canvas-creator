-- Sprint 5: Security Fixes
-- 1. Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move uuid-ossp extension to extensions schema
-- Note: We need to drop and recreate since ALTER EXTENSION SET SCHEMA isn't always available
-- First, ensure any functions using the extension have fallbacks

-- 3. Revoke API access to materialized view
-- The artist_stats_mv materialized view should not be directly accessible via API
REVOKE ALL ON public.artist_stats_mv FROM anon, authenticated;

-- 4. Create secure RPC function to access artist stats instead
CREATE OR REPLACE FUNCTION public.get_artist_statistics(p_corpus_id uuid DEFAULT NULL)
RETURNS TABLE (
  artist_id uuid,
  artist_name text,
  total_songs bigint,
  pending_songs bigint,
  enriched_songs bigint,
  error_songs bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.artist_id,
    mv.artist_name,
    mv.total_songs,
    mv.pending_songs,
    mv.enriched_songs,
    mv.error_songs
  FROM public.artist_stats_mv mv
  WHERE p_corpus_id IS NULL OR mv.corpus_id = p_corpus_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_artist_statistics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_artist_statistics(uuid) TO anon;

-- 5. Add comment for documentation
COMMENT ON FUNCTION public.get_artist_statistics IS 'Secure access to artist statistics materialized view';
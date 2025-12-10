-- Conceder permissões de leitura na materialized view artist_stats_mv
-- Isso permite que a view artist_stats_secure funcione corretamente
GRANT SELECT ON artist_stats_mv TO anon;
GRANT SELECT ON artist_stats_mv TO authenticated;
-- ==================== Habilitar extensões pg_cron e pg_net ====================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Dar permissões necessárias
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ==================== Cron Job: Sincronizar a cada 6 horas ====================
SELECT cron.schedule(
  'sync-construction-log-every-6h',
  '0 */6 * * *', -- A cada 6 horas (0h, 6h, 12h, 18h)
  $$
  SELECT net.http_post(
    url := 'https://kywmhuubbsvclkorxrse.supabase.co/functions/v1/sync-construction-log',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d21odXViYnN2Y2xrb3J4cnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDY4OTcsImV4cCI6MjA3ODgyMjg5N30.XFZgYLAG2YLM2YiEsw_aFBamtR1y8llKXYJq5Yq8h64'
    ),
    body := jsonb_build_object(
      'trigger', 'cron',
      'sources', ARRAY['construction-log']
    )
  ) as request_id;
  $$
);

-- ==================== Cron Job: Auditoria diária às 3h da manhã ====================
SELECT cron.schedule(
  'audit-project-metrics-daily',
  '0 3 * * *', -- Todo dia às 3h
  $$
  SELECT net.http_post(
    url := 'https://kywmhuubbsvclkorxrse.supabase.co/functions/v1/audit-project-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d21odXViYnN2Y2xrb3J4cnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDY4OTcsImV4cCI6MjA3ODgyMjg5N30.XFZgYLAG2YLM2YiEsw_aFBamtR1y8llKXYJq5Yq8h64'
    ),
    body := jsonb_build_object(
      'trigger', 'cron',
      'fullScan', true
    )
  ) as request_id;
  $$
);
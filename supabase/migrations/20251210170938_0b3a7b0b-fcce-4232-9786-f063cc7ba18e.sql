-- Sprint AUD-P6: Métricas Realtime + Anomaly Detection

-- 1. Materialized View para métricas de throughput por período
CREATE MATERIALIZED VIEW IF NOT EXISTS enrichment_throughput_mv AS
SELECT 
  date_trunc('hour', updated_at) as period_start,
  corpus_id,
  COUNT(*) as songs_processed,
  COUNT(*) FILTER (WHERE status = 'enriched') as songs_enriched,
  COUNT(*) FILTER (WHERE status = 'error') as songs_failed,
  COALESCE(AVG(confidence_score), 0) as avg_confidence,
  MAX(updated_at) as last_activity
FROM songs
WHERE updated_at > NOW() - INTERVAL '7 days'
  AND status IN ('enriched', 'error')
GROUP BY date_trunc('hour', updated_at), corpus_id
WITH DATA;

-- Índice para queries rápidas
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrichment_throughput_period_corpus 
ON enrichment_throughput_mv (period_start, corpus_id);

CREATE INDEX IF NOT EXISTS idx_enrichment_throughput_period 
ON enrichment_throughput_mv (period_start DESC);

-- Função para refresh da MV
CREATE OR REPLACE FUNCTION refresh_enrichment_throughput_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY enrichment_throughput_mv;
END;
$$;

-- 2. Tabela para histórico de anomalias detectadas
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_name TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  
  -- Valores detectados
  expected_value NUMERIC,
  actual_value NUMERIC,
  deviation_score NUMERIC,
  
  -- Contexto
  context JSONB DEFAULT '{}',
  
  -- Timestamps e resolução
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  auto_resolved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para anomaly_detections
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_unresolved 
ON anomaly_detections (detected_at DESC) 
WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_anomaly_detections_severity 
ON anomaly_detections (severity, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_detections_type 
ON anomaly_detections (anomaly_type, detected_at DESC);

-- RLS para anomaly_detections
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anomalias são públicas para leitura"
ON anomaly_detections FOR SELECT
USING (true);

CREATE POLICY "Sistema pode inserir anomalias"
ON anomaly_detections FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar anomalias"
ON anomaly_detections FOR UPDATE
USING (true);

-- Habilitar Realtime para anomaly_detections
ALTER PUBLICATION supabase_realtime ADD TABLE anomaly_detections;
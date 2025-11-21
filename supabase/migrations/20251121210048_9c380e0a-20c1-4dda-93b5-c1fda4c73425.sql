-- Tabela para rastrear uso da API Gemini
CREATE TABLE IF NOT EXISTS gemini_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  function_name TEXT NOT NULL,
  model_used TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
  request_type TEXT NOT NULL, -- 'enrich_song', 'enrich_bio', etc
  tokens_input INTEGER,
  tokens_output INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_gemini_usage_created_at ON gemini_api_usage(created_at DESC);
CREATE INDEX idx_gemini_usage_function ON gemini_api_usage(function_name);
CREATE INDEX idx_gemini_usage_success ON gemini_api_usage(success);

-- RLS Policies
ALTER TABLE gemini_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all API usage"
  ON gemini_api_usage FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert API usage logs"
  ON gemini_api_usage FOR INSERT
  WITH CHECK (true);
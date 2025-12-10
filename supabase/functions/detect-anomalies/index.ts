import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnomalyCheck {
  name: string;
  type: 'throughput' | 'error_rate' | 'latency' | 'quota';
  method: 'z-score' | 'iqr' | 'threshold';
  sensitivity: number;
  lookbackPeriod: string;
  alertSeverity: 'info' | 'warning' | 'critical';
  description: string;
}

const ANOMALY_CHECKS: AnomalyCheck[] = [
  {
    name: 'throughput_drop',
    type: 'throughput',
    method: 'z-score',
    sensitivity: 2,
    lookbackPeriod: '24h',
    alertSeverity: 'warning',
    description: 'Taxa de processamento caiu significativamente',
  },
  {
    name: 'error_spike',
    type: 'error_rate',
    method: 'iqr',
    sensitivity: 1.5,
    lookbackPeriod: '1h',
    alertSeverity: 'critical',
    description: 'Taxa de erro acima do normal',
  },
  {
    name: 'latency_degradation',
    type: 'latency',
    method: 'z-score',
    sensitivity: 2.5,
    lookbackPeriod: '7d',
    alertSeverity: 'warning',
    description: 'Latência das funções degradada',
  },
  {
    name: 'quota_warning',
    type: 'quota',
    method: 'threshold',
    sensitivity: 0.8,
    lookbackPeriod: '24h',
    alertSeverity: 'critical',
    description: 'Quota de API próxima do limite',
  },
];

// Statistical functions
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

function calculateIQR(values: number[]): { q1: number; q3: number; iqr: number } {
  if (values.length === 0) return { q1: 0, q3: 0, iqr: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  const q1 = sorted[Math.floor(mid / 2)];
  const q3 = sorted[Math.floor((sorted.length + mid) / 2)];
  
  return { q1, q3, iqr: q3 - q1 };
}

function isIQROutlier(value: number, q1: number, q3: number, iqr: number, sensitivity: number): boolean {
  const lowerBound = q1 - sensitivity * iqr;
  const upperBound = q3 + sensitivity * iqr;
  return value < lowerBound || value > upperBound;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[detect-anomalies] Iniciando verificação de anomalias...');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const detectedAnomalies: Array<{
      checkName: string;
      anomalyType: string;
      severity: string;
      expectedValue: number;
      actualValue: number;
      deviationScore: number;
      context: Record<string, unknown>;
    }> = [];

    // Check 1: Throughput Drop
    console.log('[detect-anomalies] Verificando throughput...');
    const { data: throughputData } = await supabase
      .from('enrichment_throughput_mv')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(48); // 48 hours of data

    if (throughputData && throughputData.length > 2) {
      const hourlyTotals = throughputData.map(d => d.songs_processed || 0);
      const currentRate = hourlyTotals[0] || 0;
      const historicalRates = hourlyTotals.slice(1);
      
      const mean = calculateMean(historicalRates);
      const stdDev = calculateStdDev(historicalRates, mean);
      const zScore = calculateZScore(currentRate, mean, stdDev);
      
      // Detect significant drop (negative z-score)
      if (zScore < -2 && mean > 0) {
        detectedAnomalies.push({
          checkName: 'throughput_drop',
          anomalyType: 'throughput',
          severity: Math.abs(zScore) > 3 ? 'critical' : 'warning',
          expectedValue: mean,
          actualValue: currentRate,
          deviationScore: zScore,
          context: { historicalMean: mean, stdDev, lookback: '48h' },
        });
        console.log(`[detect-anomalies] ⚠️ Throughput drop detectado: ${currentRate} vs média ${mean.toFixed(1)}`);
      }
    }

    // Check 2: Error Spike
    console.log('[detect-anomalies] Verificando taxa de erro...');
    const { data: errorData } = await supabase
      .from('enrichment_jobs')
      .select('songs_failed, songs_processed, updated_at')
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false });

    if (errorData && errorData.length > 0) {
      const errorRates = errorData
        .filter(d => d.songs_processed > 0)
        .map(d => (d.songs_failed || 0) / d.songs_processed);
      
      if (errorRates.length > 2) {
        const currentErrorRate = errorRates[0] || 0;
        const { q1, q3, iqr } = calculateIQR(errorRates.slice(1));
        
        if (isIQROutlier(currentErrorRate, q1, q3, iqr, 1.5) && currentErrorRate > q3) {
          const severity = currentErrorRate > 0.5 ? 'critical' : 'warning';
          detectedAnomalies.push({
            checkName: 'error_spike',
            anomalyType: 'error_rate',
            severity,
            expectedValue: q3,
            actualValue: currentErrorRate,
            deviationScore: (currentErrorRate - q3) / (iqr || 0.01),
            context: { q1, q3, iqr, threshold: q3 + 1.5 * iqr },
          });
          console.log(`[detect-anomalies] ⚠️ Error spike detectado: ${(currentErrorRate * 100).toFixed(1)}%`);
        }
      }
    }

    // Check 3: Latency Degradation
    console.log('[detect-anomalies] Verificando latência...');
    const { data: latencyData } = await supabase
      .from('edge_function_metrics')
      .select('avg_response_time_ms, period_start')
      .order('period_start', { ascending: false })
      .limit(168); // 7 days hourly

    if (latencyData && latencyData.length > 2) {
      const latencies = latencyData.map(d => d.avg_response_time_ms || 0).filter(l => l > 0);
      const currentLatency = latencies[0] || 0;
      const historicalLatencies = latencies.slice(1);
      
      const mean = calculateMean(historicalLatencies);
      const stdDev = calculateStdDev(historicalLatencies, mean);
      const zScore = calculateZScore(currentLatency, mean, stdDev);
      
      // Detect significant increase (positive z-score)
      if (zScore > 2.5) {
        detectedAnomalies.push({
          checkName: 'latency_degradation',
          anomalyType: 'latency',
          severity: zScore > 4 ? 'critical' : 'warning',
          expectedValue: mean,
          actualValue: currentLatency,
          deviationScore: zScore,
          context: { historicalMean: mean, stdDev, lookback: '7d' },
        });
        console.log(`[detect-anomalies] ⚠️ Latency degradation: ${currentLatency}ms vs média ${mean.toFixed(0)}ms`);
      }
    }

    // Check 4: API Quota Warning (Gemini usage)
    console.log('[detect-anomalies] Verificando quota de API...');
    const { data: quotaData } = await supabase
      .from('gemini_api_usage')
      .select('tokens_input, tokens_output')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (quotaData) {
      const totalTokens = quotaData.reduce((sum, d) => 
        sum + (d.tokens_input || 0) + (d.tokens_output || 0), 0
      );
      const DAILY_LIMIT = 1000000; // Exemplo: 1M tokens/dia
      const usageRatio = totalTokens / DAILY_LIMIT;
      
      if (usageRatio > 0.8) {
        detectedAnomalies.push({
          checkName: 'quota_warning',
          anomalyType: 'quota',
          severity: usageRatio > 0.95 ? 'critical' : 'warning',
          expectedValue: DAILY_LIMIT,
          actualValue: totalTokens,
          deviationScore: usageRatio,
          context: { usagePercent: usageRatio * 100, dailyLimit: DAILY_LIMIT },
        });
        console.log(`[detect-anomalies] ⚠️ Quota warning: ${(usageRatio * 100).toFixed(1)}% usado`);
      }
    }

    // Insert detected anomalies
    if (detectedAnomalies.length > 0) {
      console.log(`[detect-anomalies] Inserindo ${detectedAnomalies.length} anomalia(s)...`);
      
      // Check for existing unresolved alerts to avoid duplicates
      const { data: existingAlerts } = await supabase
        .from('anomaly_detections')
        .select('check_name')
        .is('resolved_at', null)
        .gte('detected_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      const existingCheckNames = new Set(existingAlerts?.map(a => a.check_name) || []);
      
      const newAnomalies = detectedAnomalies.filter(a => !existingCheckNames.has(a.checkName));
      
      if (newAnomalies.length > 0) {
        const { error: insertError } = await supabase
          .from('anomaly_detections')
          .insert(newAnomalies.map(a => ({
            check_name: a.checkName,
            anomaly_type: a.anomalyType,
            severity: a.severity,
            expected_value: a.expectedValue,
            actual_value: a.actualValue,
            deviation_score: a.deviationScore,
            context: a.context,
          })));

        if (insertError) {
          console.error('[detect-anomalies] Erro ao inserir anomalias:', insertError);
        } else {
          console.log(`[detect-anomalies] ✅ ${newAnomalies.length} nova(s) anomalia(s) registrada(s)`);
        }
      } else {
        console.log('[detect-anomalies] Todas as anomalias já foram registradas recentemente');
      }
    } else {
      console.log('[detect-anomalies] ✅ Nenhuma anomalia detectada');
    }

    // Auto-resolve old alerts that are no longer anomalous
    const { error: resolveError } = await supabase
      .from('anomaly_detections')
      .update({ 
        resolved_at: new Date().toISOString(),
        auto_resolved: true,
      })
      .is('resolved_at', null)
      .lt('detected_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // Older than 2h

    if (resolveError) {
      console.error('[detect-anomalies] Erro ao auto-resolver:', resolveError);
    }

    const duration = Date.now() - startTime;
    console.log(`[detect-anomalies] Concluído em ${duration}ms. ${detectedAnomalies.length} anomalia(s) detectada(s).`);

    return new Response(
      JSON.stringify({
        success: true,
        anomaliesDetected: detectedAnomalies.length,
        anomalies: detectedAnomalies,
        duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[detect-anomalies] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProjectMetrics {
  totalFiles: number;
  totalLOC: number;
  breakdown?: {
    components?: number;
    pages?: number;
    hooks?: number;
    contexts?: number;
    edgeFunctions?: number;
  };
  commit?: string;
  branch?: string;
  trigger: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 DEBUG: Iniciando processamento da requisição');
    console.log('🔍 DEBUG: Content-Type:', req.headers.get('Content-Type'));
    console.log('🔍 DEBUG: Method:', req.method);
    
    // Log do body raw antes do parse
    const rawBody = await req.text();
    console.log('🔍 DEBUG: Raw Body recebido:');
    console.log(rawBody);
    console.log('🔍 DEBUG: Tamanho do body:', rawBody.length, 'bytes');
    console.log('🔍 DEBUG: Primeiros 100 caracteres:', rawBody.substring(0, 100));
    
    // Tentar fazer parse do JSON
    let metrics: ProjectMetrics;
    try {
      metrics = JSON.parse(rawBody);
      console.log('✅ DEBUG: JSON parseado com sucesso');
    } catch (parseError) {
      console.error('❌ DEBUG: Erro ao parsear JSON:', parseError);
      console.error('❌ DEBUG: Raw body que causou erro:', rawBody);
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`Erro ao parsear JSON: ${errorMessage}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📊 Recebendo métricas:', metrics);

    // Validar dados recebidos
    if (!metrics.totalFiles || !metrics.totalLOC) {
      throw new Error('Métricas incompletas: totalFiles e totalLOC são obrigatórios');
    }

    // Buscar última auditoria para calcular delta
    const { data: lastAudit } = await supabase
      .from('phase_metrics')
      .select('value_after')
      .eq('metric_name', 'total_loc')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const improvementPercentage = lastAudit?.value_after
      ? ((metrics.totalLOC - lastAudit.value_after) / lastAudit.value_after) * 100
      : 0;

    // Inserir métricas atuais
    const metricsToInsert = [
      {
        metric_name: 'total_loc',
        value_before: lastAudit?.value_after || 0,
        value_after: metrics.totalLOC,
        improvement_percentage: improvementPercentage,
        unit: 'lines',
        phase_id: null // Métrica global, não vinculada a fase específica
      },
      {
        metric_name: 'total_files',
        value_before: 0,
        value_after: metrics.totalFiles,
        improvement_percentage: 0,
        unit: 'files',
        phase_id: null
      }
    ];

    // Adicionar breakdown se disponível
    if (metrics.breakdown) {
      if (metrics.breakdown.components) {
        metricsToInsert.push({
          metric_name: 'components_loc',
          value_before: 0,
          value_after: metrics.breakdown.components,
          improvement_percentage: 0,
          unit: 'lines',
          phase_id: null
        });
      }
      if (metrics.breakdown.pages) {
        metricsToInsert.push({
          metric_name: 'pages_loc',
          value_before: 0,
          value_after: metrics.breakdown.pages,
          improvement_percentage: 0,
          unit: 'lines',
          phase_id: null
        });
      }
      if (metrics.breakdown.hooks) {
        metricsToInsert.push({
          metric_name: 'hooks_loc',
          value_before: 0,
          value_after: metrics.breakdown.hooks,
          improvement_percentage: 0,
          unit: 'lines',
          phase_id: null
        });
      }
    }

    const { error: insertError } = await supabase
      .from('phase_metrics')
      .insert(metricsToInsert);

    if (insertError) throw insertError;

    console.log(`✅ Métricas auditadas: ${metrics.totalLOC} LOC, ${metrics.totalFiles} arquivos`);
    console.log(`📈 Crescimento desde última auditoria: ${improvementPercentage.toFixed(2)}%`);

    return new Response(
      JSON.stringify({
        status: 'success',
        metrics,
        improvementPercentage: improvementPercentage.toFixed(2),
        commit: metrics.commit,
        branch: metrics.branch,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

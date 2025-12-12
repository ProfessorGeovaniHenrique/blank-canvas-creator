/**
 * Health Check Edge Function
 * Retorna status de saúde do sistema incluindo backpressure
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHealthCheck } from "../_shared/health-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let includeBackpressure = false;
    
    // Parse body se existir
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        includeBackpressure = body.includeBackpressure === true;
      } catch {
        // Body vazio ou inválido, usar default
      }
    }

    const healthStatus = await createHealthCheck('health-check', '1.0.0', includeBackpressure);

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: healthStatus.status === 'unhealthy' ? 503 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[health-check] Error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

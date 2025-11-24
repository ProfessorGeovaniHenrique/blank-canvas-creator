import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { handleSingleMode, handleDatabaseMode, handleLegacyMode } from "./modes.ts";
import { createEdgeLogger } from "../_shared/unified-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const log = createEdgeLogger('enrich-music-data', requestId);
  
  log.info('Request received', { method: req.method });
  
  if (req.method === 'OPTIONS') {
    log.debug('CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    log.debug('Supabase client initialized');

    const body = await req.json();
    const mode = body.mode || 'single';
    
    log.info('Enrichment mode determined', { mode, songId: body.songId, artistId: body.artistId });
    
    if (mode === 'database') {
      return await handleDatabaseMode(body, supabase, log);
    } else if (mode === 'legacy') {
      return await handleLegacyMode(body, log);
    } else {
      return await handleSingleMode(body, supabase, log);
    }

  } catch (error) {
    log.fatal('Enrichment request failed', error instanceof Error ? error : new Error(String(error)));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        requestId,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

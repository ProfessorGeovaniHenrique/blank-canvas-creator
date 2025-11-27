import { createSupabaseClient } from '../_shared/supabase.ts';
import { createEdgeLogger } from '../_shared/unified-logger.ts';

const log = createEdgeLogger('get-job-songs-progress');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SongProgress {
  id: string;
  title: string;
  totalWords: number;
  processedWords: number;
  status: 'completed' | 'processing' | 'pending';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createSupabaseClient();

    // Buscar job para obter artist_id e current_song_index
    const { data: job, error: jobError } = await supabase
      .from('semantic_annotation_jobs')
      .select('artist_id, current_song_index')
      .eq('id', jobId)
      .single();

    // Se job não encontrado, retornar array vazio (não é erro fatal)
    if (jobError) {
      if (jobError.code === 'PGRST116') {
        // PGRST116 = no rows found
        log.info('Job not found, returning empty array', { jobId });
        return new Response(
          JSON.stringify({ songs: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw jobError;
    }

    if (!job) {
      log.info('Job data is null, returning empty array', { jobId });
      return new Response(
        JSON.stringify({ songs: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar todas as músicas do artista
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, title, lyrics')
      .eq('artist_id', job.artist_id)
      .order('title');

    if (songsError) {
      throw songsError;
    }

    if (!songs) {
      return new Response(
        JSON.stringify({ songs: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // OTIMIZAÇÃO CRÍTICA: Buscar todas as contagens de uma vez (1 query em vez de N)
    const songIds = songs.map(s => s.id);
    const { data: cacheEntries, error: cacheError } = await supabase
      .from('semantic_disambiguation_cache')
      .select('song_id')
      .in('song_id', songIds);

    if (cacheError) {
      log.error('Error fetching cache counts', cacheError);
    }

    // Agregar contagens no JavaScript usando Map
    const countMap = new Map<string, number>();
    if (cacheEntries) {
      cacheEntries.forEach(entry => {
        const current = countMap.get(entry.song_id) || 0;
        countMap.set(entry.song_id, current + 1);
      });
    }

    // Mapear resultados de forma síncrona (sem await)
    const songsProgress: SongProgress[] = songs.map((song, index) => {
      // Garantir que lyrics não seja null
      const lyrics = song.lyrics || '';
      
      // Se lyrics está vazio, retornar progresso zero
      if (!lyrics.trim()) {
        return {
          id: song.id,
          title: song.title,
          totalWords: 0,
          processedWords: 0,
          status: 'pending' as const,
        };
      }

      const words = lyrics
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w: string) => w.length > 0);
      
      const totalWords = words.length;
      const processedWords = countMap.get(song.id) || 0;

      // Determinar status
      let status: 'completed' | 'processing' | 'pending';
      if (processedWords >= totalWords && totalWords > 0) {
        status = 'completed';
      } else if (index === job.current_song_index) {
        status = 'processing';
      } else {
        status = 'pending';
      }

      return {
        id: song.id,
        title: song.title,
        totalWords,
        processedWords,
        status,
      };
    });

    log.info('Songs progress fetched', { 
      jobId, 
      totalSongs: songsProgress.length,
      completed: songsProgress.filter(s => s.status === 'completed').length 
    });

    return new Response(
      JSON.stringify({ songs: songsProgress }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log.error('Error fetching songs progress', error as Error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

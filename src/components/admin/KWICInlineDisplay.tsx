import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { extractKWICContext, KWICResult } from '@/lib/kwicUtils';
import { Loader2, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  palavra: string;
  songId: string | null;
  maxVisible?: number;
  className?: string;
}

export function KWICInlineDisplay({ palavra, songId, maxVisible = 3, className }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data: songData, isLoading } = useQuery({
    queryKey: ['song-lyrics-kwic', songId],
    queryFn: async () => {
      if (!songId) return null;
      
      const { data, error } = await supabase
        .from('songs')
        .select('title, lyrics, artist_id')
        .eq('id', songId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!songId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get artist name
  const { data: artistData } = useQuery({
    queryKey: ['artist-name', songData?.artist_id],
    queryFn: async () => {
      if (!songData?.artist_id) return null;
      
      const { data, error } = await supabase
        .from('artists')
        .select('name')
        .eq('id', songData.artist_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!songData?.artist_id,
    staleTime: 10 * 60 * 1000,
  });

  if (!songId) {
    return (
      <div className={cn('text-sm text-muted-foreground italic', className)}>
        Contexto não disponível (sem song_id)
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando contexto...
      </div>
    );
  }

  if (!songData?.lyrics) {
    return (
      <div className={cn('text-sm text-muted-foreground italic', className)}>
        Letra não disponível
      </div>
    );
  }

  const kwicResults: KWICResult[] = extractKWICContext(songData.lyrics, palavra, 40);
  
  if (kwicResults.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground italic', className)}>
        Palavra não encontrada na letra
      </div>
    );
  }

  const visibleResults = expanded ? kwicResults : kwicResults.slice(0, maxVisible);
  const hasMore = kwicResults.length > maxVisible;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Song info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Music className="h-3 w-3" />
        <span className="font-medium">{songData.title}</span>
        {artistData?.name && (
          <>
            <span>•</span>
            <span>{artistData.name}</span>
          </>
        )}
        <span className="text-primary">({kwicResults.length} ocorrência{kwicResults.length > 1 ? 's' : ''})</span>
      </div>

      {/* KWIC lines */}
      <div className="space-y-1.5 font-mono text-sm">
        {visibleResults.map((kwic, index) => (
          <div key={index} className="leading-relaxed bg-muted/30 rounded px-2 py-1">
            <span className="text-muted-foreground">{kwic.leftContext}</span>
            {' '}
            <span className="font-bold text-primary bg-primary/10 px-1 rounded">
              {kwic.keyword}
            </span>
            {' '}
            <span className="text-muted-foreground">{kwic.rightContext}</span>
          </div>
        ))}
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Ver mais {kwicResults.length - maxVisible} ocorrência{kwicResults.length - maxVisible > 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

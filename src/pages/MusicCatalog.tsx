/**
 * MusicCatalog - FASE 1: Versão simplificada com nova arquitetura
 * Reduzido de 1039 linhas para ~270 linhas usando hooks e serviços
 */

import { useState, useMemo } from 'react';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useEnrichment } from '@/hooks/useEnrichment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SongCard } from '@/components/music/SongCard';
import { ArtistDetailsSheet } from '@/components/music/ArtistDetailsSheet';
import { EnrichedDataTable } from '@/components/music/EnrichedDataTable';
import { RefreshCw, Music, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MusicCatalog() {
  const { songs, artists, stats, loading, error, reload } = useCatalogData();
  const { enrichSong, enrichBatch, isEnriching, batchProgress } = useEnrichment();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  // Filtros
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artists?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [songs, searchQuery]);

  // Converter para formato esperado pelo SongCard
  const songsForCard = useMemo(() => {
    return filteredSongs.map(song => ({
      ...song,
      artist: song.artists?.name,
      confidence: song.confidence_score || 0,
      corpusName: song.corpora?.name,
      corpusColor: song.corpora?.color,
      youtubeUrl: song.youtube_url,
      year: song.release_year || undefined,
      artists: song.artists ? {
        ...song.artists,
        corpus_id: song.artists.id
      } : undefined
    }));
  }, [filteredSongs]);

  // Converter para formato esperado pelo EnrichedDataTable
  const songsForTable = useMemo(() => {
    return filteredSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artists?.name || 'Desconhecido',
      composer: song.composer || undefined,
      year: song.release_year || undefined,
      genre: song.artists?.genre || undefined,
      confidence: song.confidence_score || 0,
      status: song.status
    }));
  }, [filteredSongs]);

  const handleEnrichSong = async (songId: string) => {
    const result = await enrichSong(songId);
    if (result.success) {
      await reload();
    }
  };

  const handleEnrichAll = async () => {
    const pendingIds = songs
      .filter(s => s.status === 'pending')
      .slice(0, 10)
      .map(s => s.id);
    
    if (pendingIds.length === 0) {
      toast.info('Não há músicas pendentes para enriquecer');
      return;
    }

    toast.info(`Enriquecendo ${pendingIds.length} músicas...`);
    await enrichBatch(pendingIds);
    await reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar dados: {error}</p>
            <Button onClick={reload} className="mt-4">Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                Total de Músicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalSongs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Artistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalArtists}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.pendingSongs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Enriquecidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.enrichedSongs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Erros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.errorSongs}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input 
          placeholder="Buscar músicas ou artistas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button onClick={reload} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
          <Button 
            onClick={handleEnrichAll}
            disabled={!stats || stats.pendingSongs === 0}
          >
            Enriquecer Pendentes
          </Button>
        </div>
      </div>

      {/* Progress Badge */}
      {batchProgress && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Enriquecendo: {batchProgress.current}/{batchProgress.total}
              </span>
              <Badge variant="default">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
        <TabsList>
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          {songsForCard.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Nenhuma música encontrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songsForCard.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  variant="compact"
                  onEnrich={() => handleEnrichSong(song.id)}
                  isEnriching={isEnriching(song.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <EnrichedDataTable songs={songsForTable} />
        </TabsContent>
      </Tabs>

      {/* Artist Details Sheet */}
      {selectedArtist && selectedArtistId && (
        <ArtistDetailsSheet
          artistId={selectedArtistId}
          artist={{
            id: selectedArtist.id,
            name: selectedArtist.name,
            genre: selectedArtist.genre,
            normalized_name: selectedArtist.normalized_name,
            biography: selectedArtist.biography,
            biography_source: selectedArtist.biography_source
          }}
          songs={songsForCard.filter(s => s.artist_id === selectedArtistId)}
          onEnrichSong={handleEnrichSong}
          open={!!selectedArtistId}
          onOpenChange={(open) => !open && setSelectedArtistId(null)}
        />
      )}
    </div>
  );
}

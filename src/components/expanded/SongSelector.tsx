import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Song {
  id: string;
  title: string;
  artist_name: string;
  lyrics: string;
}

interface SongSelectorProps {
  onSelect: (song: { artista: string; musica: string; letra: string } | null) => void;
}

export function SongSelector({ onSelect }: SongSelectorProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          id, 
          title, 
          lyrics,
          artists!inner(name)
        `)
        .not('lyrics', 'is', null)
        .limit(100)
        .order('title');

      if (error) throw error;
      
      const formattedSongs: Song[] = (data || []).map((song: any) => ({
        id: song.id,
        title: song.title,
        artist_name: song.artists?.name || 'Desconhecido',
        lyrics: song.lyrics
      }));
      
      setSongs(formattedSongs);
    } catch (error: any) {
      console.error("Erro ao carregar músicas:", error);
      toast.error("Erro ao carregar músicas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSong = (songId: string) => {
    setSelectedId(songId);
    const song = songs.find(s => s.id === songId);
    if (song) {
      onSelect({
        artista: song.artist_name,
        musica: song.title,
        letra: song.lyrics
      });
    } else {
      onSelect(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={selectedId} onValueChange={handleSelectSong}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma música..." />
      </SelectTrigger>
      <SelectContent>
        {songs.map((song) => (
          <SelectItem key={song.id} value={song.id}>
            {song.artist_name} - {song.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

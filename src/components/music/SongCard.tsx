import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Eye, Edit, Sparkles, Loader2, AlertCircle, CheckCircle2, MoreVertical, RefreshCw, Trash2, Folder, Youtube, Play, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
  genre?: string;
  confidence: number;
  thumbnail?: string;
  status?: string;
  corpusName?: string | null;
  corpusColor?: string | null;
  youtubeUrl?: string | null;
}

interface SongCardProps {
  song: Song;
  onView?: (song: Song) => void;
  onEdit?: (song: Song) => void;
  onEnrich?: (songId: string) => void;
  onReEnrich?: (songId: string) => void;
  onMarkReviewed?: (songId: string) => void;
  onDelete?: (songId: string) => void;
  isEnriching?: boolean;
}

// Função auxiliar para extrair Video ID da URL do YouTube
const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Suporta formatos: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
};

export function SongCard({ song, onView, onEdit, onEnrich, onReEnrich, onMarkReviewed, onDelete, isEnriching }: SongCardProps) {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoId = song.youtubeUrl ? extractYoutubeVideoId(song.youtubeUrl) : null;
  
  // Lógica de thumbnail: prioriza YouTube, depois thumbnail do banco, depois fallback
  const thumbnailUrl = videoId && !thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : song.thumbnail || null;
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      pending: { 
        label: 'Pendente', 
        variant: 'warning' as const,
        icon: AlertCircle,
        tooltip: 'Aguardando enriquecimento de metadados'
      },
      enriched: { 
        label: 'Enriquecida', 
        variant: 'success' as const,
        icon: CheckCircle2,
        tooltip: 'Metadados enriquecidos com sucesso'
      },
      processed: { 
        label: 'Processada', 
        variant: 'info' as const,
        icon: CheckCircle2,
        tooltip: 'Música processada do arquivo original'
      },
      error: {
        label: 'Erro',
        variant: 'destructive' as const,
        icon: AlertCircle,
        tooltip: 'Falha no enriquecimento - clique para tentar novamente'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={config.variant} className="flex items-center gap-1 cursor-help">
              <Icon className="w-3 h-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined || confidence === 0) return null;
    
    const getVariantAndTooltip = (score: number) => {
      if (score >= 0.8) return { variant: 'success' as const, tooltip: 'Alta confiança - Dados verificados' };
      if (score >= 0.5) return { variant: 'warning' as const, tooltip: 'Confiança média - Revisar dados' };
      return { variant: 'destructive' as const, tooltip: 'Baixa confiança - Verificação necessária' };
    };

    const { variant, tooltip } = getVariantAndTooltip(confidence);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={variant} className="cursor-help">
              ✓ {(confidence * 100).toFixed(0)}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="flex flex-row p-0">
        {/* Thumbnail (Esquerda) */}
        <div 
          className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-muted flex items-center justify-center relative overflow-hidden group cursor-pointer"
          onClick={() => videoId && setShowVideoPlayer(!showVideoPlayer)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setThumbnailError(true)}
            />
          ) : (
            <Music className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
          )}
          
          {/* Hover Overlay com Play Icon */}
          {videoId && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          )}
          
          {/* Badges posicionados no canto superior direito da thumbnail */}
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            {getStatusBadge(song.status)}
            {song.confidence > 0 && getConfidenceBadge(song.confidence)}
          </div>
        </div>

        {/* Conteúdo (Direita) */}
        <div className="flex-1 p-4 space-y-2 min-w-0">
          {/* Header: Título + Ações */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1" title={song.title}>
              {song.title}
            </h3>
            
            {/* Botões de Ação + Dropdown */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {videoId && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assistir no card</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => window.open(song.youtubeUrl!, '_blank', 'noopener,noreferrer')}
                        >
                          <Youtube className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Abrir no YouTube</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              
              {song.status === 'enriched' && (
                <Badge variant="success" className="text-xs">
                  Enriquecido
                </Badge>
              )}
              
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(song)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Manualmente
                    </DropdownMenuItem>
                  )}
                  {onReEnrich && (
                    <DropdownMenuItem onClick={() => onReEnrich(song.id)} disabled={isEnriching}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isEnriching ? 'animate-spin' : ''}`} />
                      Re-enriquecer
                    </DropdownMenuItem>
                  )}
                  {onMarkReviewed && song.status !== 'approved' && (
                    <DropdownMenuItem onClick={() => onMarkReviewed(song.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marcar como Revisado
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(song.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar Música
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Metadados em Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Compositor</span>
              <p className="text-foreground font-medium">Não identificado</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ano de Lançamento</span>
              <p className="text-foreground font-medium flex items-center gap-1">
                {song.year || '—'}
                {song.year && <Edit className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />}
              </p>
            </div>
          </div>
          
          {/* Fonte e Confiança */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Fonte: AI</span>
            {song.confidence > 0 && (
              <span className="text-success">Confiança: {(song.confidence * 100).toFixed(0)}%</span>
            )}
          </div>
          
          {/* Badges Adicionais */}
          <div className="flex flex-wrap gap-2">
            {song.corpusName && (
              <Badge 
                variant="outline" 
                className="border-2 text-xs"
                style={{ borderColor: song.corpusColor || '#3B82F6' }}
              >
                <Folder className="w-3 h-3 mr-1" />
                {song.corpusName}
              </Badge>
            )}
            {song.genre && (
              <Badge variant="secondary" className="text-xs">
                {song.genre}
              </Badge>
            )}
          </div>

          {/* YouTube Player Embed */}
          {showVideoPlayer && videoId && (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black animate-fade-in">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          )}
          
          {/* Botão Ver Letra */}
          {onView && (
            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm"
              onClick={() => onView(song)}
            >
              Ocultar Letra
              <AlertCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

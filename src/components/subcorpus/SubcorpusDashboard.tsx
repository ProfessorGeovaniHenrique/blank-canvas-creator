import { useState, useMemo } from 'react';
import { SubcorpusMetadata } from '@/data/types/subcorpus.types';
import { SubcorpusCard } from './SubcorpusCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Music, TrendingUp, Hash } from 'lucide-react';

interface SubcorpusDashboardProps {
  subcorpora: SubcorpusMetadata[];
  onSelectSubcorpus?: (artista: string) => void;
  selectedArtista?: string | null;
}

type SortOption = 'musicas' | 'palavras' | 'riqueza' | 'vocabulario';

export function SubcorpusDashboard({ 
  subcorpora, 
  onSelectSubcorpus,
  selectedArtista 
}: SubcorpusDashboardProps) {
  const [sortBy, setSortBy] = useState<SortOption>('palavras');
  
  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalMusicas = subcorpora.reduce((acc, s) => acc + s.totalMusicas, 0);
    const totalPalavras = subcorpora.reduce((acc, s) => acc + s.totalPalavras, 0);
    const avgRiqueza = subcorpora.reduce((acc, s) => acc + s.riquezaLexical, 0) / subcorpora.length;
    
    return {
      totalArtistas: subcorpora.length,
      totalMusicas,
      totalPalavras,
      avgRiqueza: avgRiqueza * 100
    };
  }, [subcorpora]);
  
  // Ordenar subcorpora
  const sortedSubcorpora = useMemo(() => {
    return [...subcorpora].sort((a, b) => {
      switch (sortBy) {
        case 'musicas':
          return b.totalMusicas - a.totalMusicas;
        case 'palavras':
          return b.totalPalavras - a.totalPalavras;
        case 'riqueza':
          return b.riquezaLexical - a.riquezaLexical;
        case 'vocabulario':
          return b.totalPalavrasUnicas - a.totalPalavrasUnicas;
        default:
          return 0;
      }
    });
  }, [subcorpora, sortBy]);
  
  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Artistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalArtistas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Music className="h-4 w-4" />
              Total de Músicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMusicas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Total de Palavras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalPalavras.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Riqueza Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.avgRiqueza.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controles de Ordenação */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subcorpora por Artista</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em um card para selecioná-lo para análise
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="palavras">Mais palavras</SelectItem>
              <SelectItem value="musicas">Mais músicas</SelectItem>
              <SelectItem value="riqueza">Maior riqueza lexical</SelectItem>
              <SelectItem value="vocabulario">Maior vocabulário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Grid de Subcorpora */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSubcorpora.map((sub, idx) => (
          <SubcorpusCard
            key={sub.id}
            metadata={sub}
            rank={idx + 1}
            onClick={() => onSelectSubcorpus?.(sub.artista)}
            isSelected={selectedArtista === sub.artista}
          />
        ))}
      </div>
      
      {subcorpora.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum subcorpus disponível. Carregue um corpus completo para visualizar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

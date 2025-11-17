import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, SortAsc } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type SortOption = 'nome' | 'codigo' | 'data-criacao' | 'validacoes';
export type NivelFilter = 'todos' | '1' | '2' | '3' | '4';

interface TagsetSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  nivelFilter: NivelFilter;
  onNivelChange: (nivel: NivelFilter) => void;
  resultCount?: number;
}

export function TagsetSearchFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  nivelFilter,
  onNivelChange,
  resultCount
}: TagsetSearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onSortChange('nome');
    onNivelChange('todos');
  };

  const hasActiveFilters = searchQuery || sortBy !== 'nome' || nivelFilter !== 'todos';

  return (
    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
      {/* Busca Principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-accent rounded p-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros Avançados */}
      {isFilterOpen && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">
              Ordenar por
            </label>
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-3 w-3" />
                    Nome (A-Z)
                  </div>
                </SelectItem>
                <SelectItem value="codigo">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-3 w-3" />
                    Código
                  </div>
                </SelectItem>
                <SelectItem value="data-criacao">Data de Criação</SelectItem>
                <SelectItem value="validacoes">Nº de Validações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">
              Nível Hierárquico
            </label>
            <Select value={nivelFilter} onValueChange={(v) => onNivelChange(v as NivelFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Níveis</SelectItem>
                <SelectItem value="1">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                    Nível 1
                  </Badge>
                </SelectItem>
                <SelectItem value="2">
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                    Nível 2
                  </Badge>
                </SelectItem>
                <SelectItem value="3">
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
                    Nível 3
                  </Badge>
                </SelectItem>
                <SelectItem value="4">
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                    Nível 4
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="self-end h-9 gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      )}

      {/* Resultados */}
      {resultCount !== undefined && (
        <div className="text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      )}
    </div>
  );
}

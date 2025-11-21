import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Filter } from 'lucide-react';

interface PageToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  showSearch?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  children?: ReactNode;
}

export function PageToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onRefresh,
  showSearch = true,
  showFilter = false,
  showRefresh = true,
  leftActions,
  rightActions,
  children,
}: PageToolbarProps) {
  return (
    <div className="border-b bg-muted/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left actions */}
          <div className="flex items-center gap-2 flex-1">
            {showSearch && onSearchChange && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-9 h-9 bg-background/50"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            
            {showFilter && (
              <Button variant="ghost" size="sm" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            )}

            {leftActions}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {showRefresh && onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            )}
            
            {rightActions}
          </div>
        </div>
        
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Database, AlertTriangle, CheckCircle, Award, Loader2 } from 'lucide-react';
import { useSemanticLexiconData, SemanticLexiconEntry } from '@/hooks/useSemanticLexiconData';
import { SemanticLexiconFilters } from './SemanticLexiconFilters';
import { SemanticWordRow } from './SemanticWordRow';
import { SemanticValidationModal } from './SemanticValidationModal';

export function SemanticLexiconPanel() {
  const {
    entries,
    totalCount,
    stats,
    filters,
    page,
    totalPages,
    isLoading,
    updateFilter,
    toggleFlag,
    resetFilters,
    setPage,
    refetch,
  } = useSemanticLexiconData(50);

  const [selectedEntry, setSelectedEntry] = useState<SemanticLexiconEntry | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);

  const handleValidate = (entry: SemanticLexiconEntry) => {
    setSelectedEntry(entry);
    setValidationOpen(true);
  };

  const handleValidationSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anotado</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.toLocaleString() || '-'}</div>
            <p className="text-xs text-muted-foreground">palavras classificadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixa Confiança</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.lowConfidence.toLocaleString() || '-'}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total ? ((stats.lowConfidence / stats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisa Revisão</CardTitle>
            <CheckCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.needsReview.toLocaleString() || '-'}</div>
            <p className="text-xs text-muted-foreground">conf. &lt; 80% + fonte auto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Insígnias</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.withInsignias.toLocaleString() || '-'}</div>
            <p className="text-xs text-muted-foreground">marcadores culturais</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <SemanticLexiconFilters
            filters={filters}
            stats={stats}
            onUpdateFilter={updateFilter}
            onToggleFlag={toggleFlag}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Léxico Semântico Anotado</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mostrando {entries.length} de {totalCount.toLocaleString()} entradas
            </p>
          </div>
          <Badge variant="outline">
            Página {page + 1} de {totalPages || 1}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma entrada encontrada com os filtros atuais
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Palavra</TableHead>
                      <TableHead>Tagset</TableHead>
                      <TableHead>Domínio N1</TableHead>
                      <TableHead>POS</TableHead>
                      <TableHead>Conf.</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead className="w-24">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <SemanticWordRow
                        key={entry.id}
                        entry={entry}
                        onValidate={handleValidate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} entradas no total
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm px-2">
                    {page + 1} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Validation Modal */}
      <SemanticValidationModal
        entry={selectedEntry}
        open={validationOpen}
        onOpenChange={setValidationOpen}
        onSuccess={handleValidationSuccess}
      />
    </div>
  );
}

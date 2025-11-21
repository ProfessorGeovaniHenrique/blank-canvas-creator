import { useState } from 'react';
import { MVPHeader } from '@/components/mvp/MVPHeader';
import { MVPFooter } from '@/components/mvp/MVPFooter';
import { AdminBreadcrumb } from '@/components/AdminBreadcrumb';
import { Loader2 } from 'lucide-react';
import { ValidationWorkspace } from '@/components/validation/ValidationWorkspace';
import { useDictionaryValidation } from '@/hooks/useDictionaryValidation';

export default function AdminGauchoValidation() {
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | 'word' | 'mwe'>('all');

  const {
    entries,
    isLoading,
    error,
    refetch,
    approveEntry,
    rejectEntry,
    updateEntry,
  } = useDictionaryValidation({
    dictionaryType: 'dialectal',
    volumeFilter: 'I',
    entryTypeFilter,
    limit: 200,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MVPHeader />
        <div className="container mx-auto py-8 px-4">
          <AdminBreadcrumb currentPage="Validação Gaúcho" />
          <div className="mt-6 p-4 border border-destructive rounded-lg">
            <h3 className="font-semibold text-destructive">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
        <MVPFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MVPHeader />
      
      <div className="container mx-auto py-8 px-4">
        <AdminBreadcrumb currentPage="Validação Dicionário Gaúcho" />

        <div className="flex justify-between items-center my-6">
          <div>
            <h1 className="text-3xl font-bold">🐎 Dicionário Gaúcho Unificado</h1>
            <p className="text-muted-foreground mt-2">
              Léxico da cultura pampeana sul-rio-grandense • {entries.length.toLocaleString('pt-BR')} verbetes
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ValidationWorkspace
            entries={entries}
            isLoading={isLoading}
            onApprove={approveEntry}
            onReject={rejectEntry}
            onSave={updateEntry}
            onRefetch={refetch}
            entryTypeFilter={entryTypeFilter}
            onEntryTypeFilterChange={setEntryTypeFilter}
          />
        </div>
      </div>

      <MVPFooter />
    </div>
  );
}

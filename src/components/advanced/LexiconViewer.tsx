import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useBackendLexicon, LexiconEntry } from '@/hooks/useBackendLexicon';
import { Loader2 } from 'lucide-react';

interface LexiconViewerProps {
  onValidate: (entry: LexiconEntry) => void;
}

export function LexiconViewer({ onValidate }: LexiconViewerProps) {
  const [posFilter, setPosFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState<'all' | 'validated' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { lexicon, stats, isLoading } = useBackendLexicon({
    pos: posFilter,
    validationStatus: validationFilter,
    searchTerm
  });

  const getProsodyBadge = (prosody: number) => {
    if (prosody > 0) {
      return <Badge className="bg-green-600">Positiva (+{prosody})</Badge>;
    } else if (prosody < 0) {
      return <Badge variant="destructive">Negativa ({prosody})</Badge>;
    }
    return <Badge variant="secondary">Neutra (0)</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Léxico Semântico</CardTitle>
        <CardDescription>
          {stats.totalWords} palavras | {stats.validatedWords} validadas | {stats.pendingWords} pendentes
          <span className="ml-2 text-xs">
            (Confiança média: {(stats.avgConfidence * 100).toFixed(0)}%)
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={posFilter} onValueChange={setPosFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por POS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="VERB">Verbos</SelectItem>
              <SelectItem value="NOUN">Substantivos</SelectItem>
              <SelectItem value="ADJ">Adjetivos</SelectItem>
              <SelectItem value="ADV">Advérbios</SelectItem>
            </SelectContent>
          </Select>

          <Select value={validationFilter} onValueChange={(v) => setValidationFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="validated">Validados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Buscar palavra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Tabela */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Palavra</TableHead>
                <TableHead>Lema</TableHead>
                <TableHead>POS</TableHead>
                <TableHead>Tagset</TableHead>
                <TableHead>Prosódia</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lexicon.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma palavra encontrada
                  </TableCell>
                </TableRow>
              ) : (
                lexicon.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-semibold">{entry.palavra}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.lema || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.pos || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.tagset_codigo}</Badge>
                    </TableCell>
                    <TableCell>{getProsodyBadge(entry.prosody)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={entry.confianca * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {(entry.confianca * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.validado ? (
                        <Badge className="bg-green-600">✓ Validado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onValidate(entry)}
                      >
                        Validar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

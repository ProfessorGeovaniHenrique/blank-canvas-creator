import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnnotationJobs } from '@/hooks/useAnnotationJobs';
import { Loader2 } from 'lucide-react';

export function JobsMonitor() {
  const { jobs, stats, isLoading } = useAnnotationJobs();

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start) return '-';
    if (!end) return 'Em andamento';
    
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <CardTitle>Jobs de Anotação</CardTitle>
        <CardDescription>
          {stats.totalJobs} jobs | {stats.completedJobs} concluídos | {stats.failedJobs} falharam | {stats.totalWordsProcessed.toLocaleString()} palavras processadas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Corpus</TableHead>
                <TableHead>Palavras</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum job encontrado
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-sm">
                      {formatDate(job.tempo_inicio)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.corpus_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.total_palavras?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell>
                      {job.progresso !== null ? (
                        <div className="flex items-center gap-2">
                          <Progress value={job.progresso * 100} className="w-24 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {(job.progresso * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {calculateDuration(job.tempo_inicio, job.tempo_fim)}
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

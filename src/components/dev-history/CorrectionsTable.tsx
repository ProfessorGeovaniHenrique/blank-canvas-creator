import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { corrections, summaryMetrics } from "@/data/developer-logs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";

export function CorrectionsTable() {
  const [filter, setFilter] = useState<string | null>(null);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "crítica":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "alta":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "média":
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredCorrections = filter
    ? corrections.filter((c) => c.categoria === filter)
    : corrections;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Correções</CardDescription>
            <CardTitle className="text-3xl">{summaryMetrics.totalCorrections}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Créditos Economizados</CardDescription>
            <CardTitle className="text-3xl text-green-600">{summaryMetrics.estimatedCreditsSaved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Componentes Afetados</CardDescription>
            <CardTitle className="text-3xl">{summaryMetrics.componentsAffected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Badge
          variant={filter === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter(null)}
        >
          Todas
        </Badge>
        <Badge
          variant={filter === "Backend" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("Backend")}
        >
          Backend
        </Badge>
        <Badge
          variant={filter === "Frontend" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("Frontend")}
        >
          Frontend
        </Badge>
        <Badge
          variant={filter === "Arquitetura" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("Arquitetura")}
        >
          Arquitetura
        </Badge>
      </div>

      {/* Corrections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Correções Críticas - Novembro 2024</CardTitle>
          <CardDescription>
            Registro detalhado de correções implementadas para economia de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Créditos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCorrections.map((correction) => (
                <TableRow key={correction.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(correction.data), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{correction.categoria}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm">{correction.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {correction.componentes.slice(0, 2).join(", ")}
                      {correction.componentes.length > 2 && ` +${correction.componentes.length - 2}`}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(correction.severidade)}
                      <span className="text-sm capitalize">{correction.severidade}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600">
                    +{correction.creditosEconomizados}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

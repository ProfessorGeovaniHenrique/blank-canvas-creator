import { useState, useMemo } from "react";
import { useKeywords } from "@/hooks/useKeywords";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { KeywordEntry } from "@/data/types/corpus-tools.types";

interface KeywordsToolProps {
  corpus: 'canção' | 'gaúcho';
}

export function KeywordsTool({ corpus: initialCorpus }: KeywordsToolProps) {
  const [corpusEstudo, setCorpusEstudo] = useState<'canção' | 'gaúcho'>(initialCorpus);
  const [corpusReferencia, setCorpusReferencia] = useState<'nordestino' | 'gaúcho'>('nordestino');
  const { keywords, isLoading, error } = useKeywords(corpusEstudo, corpusReferencia);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSignificancia, setFilterSignificancia] = useState({
    Alta: true,
    Média: true,
    Baixa: true
  });
  const [filterEfeito, setFilterEfeito] = useState({
    'super-representado': true,
    'sub-representado': true
  });
  const [sortColumn, setSortColumn] = useState<keyof KeywordEntry>('ll');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter(kw => {
        // Search filter
        if (searchTerm && !kw.palavra.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Significance filter
        if (!filterSignificancia[kw.significancia]) {
          return false;
        }
        
        // Effect filter
        if (!filterEfeito[kw.efeito]) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
  }, [keywords, searchTerm, filterSignificancia, filterEfeito, sortColumn, sortDirection]);
  
  const handleSort = (column: keyof KeywordEntry) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const handleExportCSV = () => {
    const csv = [
      ['Rank', 'Palavra', 'Freq Estudo', 'Freq Referência', 'Log-Likelihood', 'MI Score', 'Efeito', 'Significância'].join(','),
      ...filteredKeywords.map((kw, idx) => [
        idx + 1,
        kw.palavra,
        kw.freqEstudo,
        kw.freqReferencia,
        kw.ll.toFixed(2),
        kw.mi.toFixed(3),
        kw.efeito,
        kw.significancia
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `keywords_${corpusEstudo}_vs_${corpusReferencia}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border border-border">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Corpus Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">📚 Corpus de Estudo</Label>
          <Select value={corpusEstudo} onValueChange={(v) => setCorpusEstudo(v as 'canção' | 'gaúcho')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="canção" disabled>
                🎵 "Quando o verso vem pras casa" (142 palavras)
              </SelectItem>
              <SelectItem value="gaúcho">
                🎸 Corpus de Músicas Gaúchas (5.001 palavras)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-semibold">🔍 Corpus de Referência</Label>
          <Select value={corpusReferencia} onValueChange={(v) => setCorpusReferencia(v as 'nordestino' | 'gaúcho')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nordestino">
                🪕 Corpus de Músicas Nordestinas (5.001 palavras)
              </SelectItem>
              <SelectItem value="gaúcho">
                🎸 Corpus de Músicas Gaúchas (5.001 palavras)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar palavra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Export Button */}
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Significance Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Significância</Label>
            <div className="flex gap-4">
              {(['Alta', 'Média', 'Baixa'] as const).map(sig => (
                <div key={sig} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sig-${sig}`}
                    checked={filterSignificancia[sig]}
                    onCheckedChange={(checked) =>
                      setFilterSignificancia(prev => ({ ...prev, [sig]: !!checked }))
                    }
                  />
                  <Label htmlFor={`sig-${sig}`} className="text-sm cursor-pointer">
                    {sig}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Effect Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Efeito</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="super"
                  checked={filterEfeito['super-representado']}
                  onCheckedChange={(checked) =>
                    setFilterEfeito(prev => ({ ...prev, 'super-representado': !!checked }))
                  }
                />
                <Label htmlFor="super" className="text-sm cursor-pointer">
                  Super-representado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sub"
                  checked={filterEfeito['sub-representado']}
                  onCheckedChange={(checked) =>
                    setFilterEfeito(prev => ({ ...prev, 'sub-representado': !!checked }))
                  }
                />
                <Label htmlFor="sub" className="text-sm cursor-pointer">
                  Sub-representado
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredKeywords.length} de {keywords.length} palavras-chave
        </div>
      </div>
      
      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Palavra</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('freqEstudo')}
                >
                  Freq Estudo {sortColumn === 'freqEstudo' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('freqReferencia')}
                >
                  Freq Ref {sortColumn === 'freqReferencia' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('ll')}
                >
                  Log-Likelihood {sortColumn === 'll' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('mi')}
                >
                  MI Score {sortColumn === 'mi' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Efeito</TableHead>
                <TableHead>Significância</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((kw, idx) => {
                const Icon = kw.efeitoIcon;
                return (
                  <TableRow key={`${kw.palavra}-${idx}`}>
                    <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-semibold">{kw.palavra}</TableCell>
                    <TableCell>{kw.freqEstudo.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{kw.freqReferencia.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="font-mono">{kw.ll.toFixed(2)}</TableCell>
                    <TableCell className="font-mono">{kw.mi.toFixed(3)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={kw.efeito === 'super-representado' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        <Icon className="w-3 h-3" />
                        {kw.efeito === 'super-representado' ? 'Super' : 'Sub'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          kw.significancia === 'Alta' ? 'default' : 
                          kw.significancia === 'Média' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {kw.significancia}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

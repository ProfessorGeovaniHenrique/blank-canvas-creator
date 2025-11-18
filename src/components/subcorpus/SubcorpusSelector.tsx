import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { SubcorpusMetadata, SubcorpusComparisonMode } from "@/data/types/subcorpus.types";
import { ArrowLeftRight, BarChart3, Users } from "lucide-react";

interface SubcorpusSelectorProps {
  subcorpora: SubcorpusMetadata[];
  selectedA: string | null;
  selectedB: string | null;
  mode: SubcorpusComparisonMode;
  onSelectA: (artista: string) => void;
  onSelectB: (artista: string | null) => void;
  onModeChange: (mode: SubcorpusComparisonMode) => void;
  onCompare?: () => void;
}

export function SubcorpusSelector({
  subcorpora,
  selectedA,
  selectedB,
  mode,
  onSelectA,
  onSelectB,
  onModeChange,
  onCompare
}: SubcorpusSelectorProps) {
  const subcorpusA = subcorpora.find(s => s.artista === selectedA);
  const subcorpusB = subcorpora.find(s => s.artista === selectedB);
  
  const handleSwap = () => {
    if (selectedA && selectedB) {
      const temp = selectedA;
      onSelectA(selectedB);
      onSelectB(temp);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Selecionar Subcorpora para Análise
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Seleção de Modo */}
        <div className="space-y-2">
          <Label>Modo de Análise</Label>
          <RadioGroup 
            value={mode} 
            onValueChange={(value) => onModeChange(value as SubcorpusComparisonMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="cursor-pointer">Individual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compare" id="compare" />
              <Label htmlFor="compare" className="cursor-pointer">Comparar Dois</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vs-rest" id="vs-rest" />
              <Label htmlFor="vs-rest" className="cursor-pointer">vs Resto do Corpus</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Seleção de Subcorpus A */}
        <div className="space-y-2">
          <Label htmlFor="subcorpus-a">
            {mode === 'single' ? 'Artista' : 'Subcorpus A'}
          </Label>
          <Select value={selectedA || ''} onValueChange={onSelectA}>
            <SelectTrigger id="subcorpus-a">
              <SelectValue placeholder="Selecione um artista" />
            </SelectTrigger>
            <SelectContent>
              {subcorpora.map(sub => (
                <SelectItem key={sub.id} value={sub.artista}>
                  {sub.artista} ({sub.totalMusicas} {sub.totalMusicas === 1 ? 'música' : 'músicas'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {subcorpusA && (
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Users className="h-3 w-3" />
              <span>
                {subcorpusA.totalMusicas} músicas • {subcorpusA.totalPalavras.toLocaleString('pt-BR')} palavras
              </span>
            </div>
          )}
        </div>
        
        {/* Seleção de Subcorpus B (apenas em modo compare) */}
        {mode === 'compare' && (
          <>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                disabled={!selectedA || !selectedB}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subcorpus-b">Subcorpus B</Label>
              <Select 
                value={selectedB || ''} 
                onValueChange={onSelectB}
                disabled={!selectedA}
              >
                <SelectTrigger id="subcorpus-b">
                  <SelectValue placeholder="Selecione outro artista" />
                </SelectTrigger>
                <SelectContent>
                  {subcorpora
                    .filter(sub => sub.artista !== selectedA)
                    .map(sub => (
                      <SelectItem key={sub.id} value={sub.artista}>
                        {sub.artista} ({sub.totalMusicas} {sub.totalMusicas === 1 ? 'música' : 'músicas'})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              {subcorpusB && (
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Users className="h-3 w-3" />
                  <span>
                    {subcorpusB.totalMusicas} músicas • {subcorpusB.totalPalavras.toLocaleString('pt-BR')} palavras
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Botão de Análise */}
        {onCompare && (
          <Button 
            onClick={onCompare}
            disabled={
              !selectedA || 
              (mode === 'compare' && !selectedB)
            }
            className="w-full"
          >
            {mode === 'single' && 'Analisar Subcorpus'}
            {mode === 'compare' && 'Comparar Subcorpora'}
            {mode === 'vs-rest' && 'Comparar com Resto do Corpus'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

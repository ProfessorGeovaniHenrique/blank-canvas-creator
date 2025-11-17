import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle2, XCircle, Edit } from "lucide-react";
import { Tagset } from "@/hooks/useTagsets";
import { generateHierarchySuggestions, HierarchySuggestion } from "@/lib/semanticSimilarity";
import { toast } from "sonner";

interface HierarchySuggesterProps {
  tagsetsPendentes: Tagset[];
  tagsetsAtivos: Tagset[];
  onAcceptSuggestion: (tagsetId: string, tagsetPaiCodigo: string) => void;
  onRejectTagset: (tagsetId: string) => void;
  onEditManual?: (tagset: Tagset) => void;
}

export function HierarchySuggester({
  tagsetsPendentes,
  tagsetsAtivos,
  onAcceptSuggestion,
  onRejectTagset,
  onEditManual,
}: HierarchySuggesterProps) {
  const [suggestions, setSuggestions] = useState<Map<string, HierarchySuggestion[]>>(new Map());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (tagsetsPendentes.length === 0 || tagsetsAtivos.length === 0) {
      setSuggestions(new Map());
      return;
    }

    setProcessing(true);
    const newSuggestions = new Map<string, HierarchySuggestion[]>();

    // Gera sugestões para cada tagset pendente
    tagsetsPendentes.forEach(pendente => {
      const suggs = generateHierarchySuggestions(pendente, tagsetsAtivos, 3);
      if (suggs.length > 0) {
        newSuggestions.set(pendente.id, suggs);
      }
    });

    setSuggestions(newSuggestions);
    setProcessing(false);
  }, [tagsetsPendentes, tagsetsAtivos]);

  const handleAccept = (tagset: Tagset, suggestion: HierarchySuggestion) => {
    onAcceptSuggestion(tagset.id, suggestion.tagsetPai.codigo);
    toast.success(`DS "${tagset.nome}" vinculado a "${suggestion.tagsetPai.nome}"`);
  };

  const handleReject = (tagset: Tagset) => {
    onRejectTagset(tagset.id);
    toast.info(`DS "${tagset.nome}" rejeitado`);
  };

  if (tagsetsPendentes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sugestões Inteligentes
          </CardTitle>
          <CardDescription>
            Não há tagsets pendentes para análise
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Sugestões Inteligentes de Hierarquia
        </CardTitle>
        <CardDescription>
          Sistema de análise semântica para posicionamento hierárquico de tagsets pendentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {processing ? (
          <div className="text-center py-8 text-muted-foreground">
            Analisando similaridade semântica...
          </div>
        ) : (
          tagsetsPendentes.map(pendente => {
            const suggs = suggestions.get(pendente.id) || [];
            
            return (
              <div key={pendente.id} className="border rounded-lg p-4 space-y-4">
                {/* Tagset Pendente */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{pendente.nome}</h4>
                        <Badge variant="outline" className="text-xs">
                          {pendente.codigo}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Pendente
                        </Badge>
                      </div>
                      {pendente.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {pendente.descricao}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(pendente)}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {pendente.exemplos && pendente.exemplos.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Exemplos:</span>
                      {pendente.exemplos.slice(0, 5).map((ex, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ex}
                        </Badge>
                      ))}
                      {pendente.exemplos.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{pendente.exemplos.length - 5} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sugestões */}
                {suggs.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Sugestões de Posicionamento:
                    </div>
                    
                    <div className="space-y-2">
                      {suggs.map((sugg, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {sugg.tagsetPai.nome}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {sugg.tagsetPai.codigo}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Nível {sugg.nivel_sugerido}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {sugg.razao}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={idx === 0 ? "default" : "outline"}
                            onClick={() => handleAccept(pendente, sugg)}
                            className="ml-2"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aceitar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-md">
                      Nenhuma sugestão automática encontrada
                    </div>
                    {onEditManual && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditManual(pendente)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Curadoria Manual
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Configure manualmente o nível e categoria pai
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

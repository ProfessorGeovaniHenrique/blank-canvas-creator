import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scientificChangelog, methodologies, scientificStats } from "@/data/developer-logs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, BookOpen, Target } from "lucide-react";

interface ScientificEvolutionProps {
  showMethodologies?: boolean;
}

export function ScientificEvolution({ showMethodologies = false }: ScientificEvolutionProps) {
  if (showMethodologies) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Metodologias Aplicadas no Projeto</CardTitle>
            <CardDescription>
              Abordagens científicas utilizadas durante o desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {methodologies.map((method, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold text-lg mb-2">{method.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {method.references.map((ref, refIdx) => (
                        <Badge key={refIdx} variant="outline" className="text-xs">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>{scientificStats.totalVersions}</CardTitle>
              <CardDescription>Versões Científicas</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>{scientificStats.totalAdvances}</CardTitle>
              <CardDescription>Avanços Documentados</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>{scientificStats.totalReferences}</CardTitle>
              <CardDescription>Referências Utilizadas</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {scientificChangelog.map((version) => (
        <Card key={version.version}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Versão {version.version}</CardTitle>
                <CardDescription>
                  {format(new Date(version.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardDescription>
              </div>
              <Badge variant="outline">{version.methodology}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {version.scientificAdvances.map((advance, idx) => (
              <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                <h4 className="font-semibold mb-1">{advance.feature}</h4>
                <p className="text-sm text-muted-foreground mb-2">{advance.linguisticBasis}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Acurácia: </span>
                    <span className="font-mono font-semibold text-green-600">
                      {typeof advance.accuracy === 'number' ? (advance.accuracy * 100).toFixed(1) : advance.accuracy}%
                    </span>
                  </div>
                  {advance.improvement && typeof advance.improvement === 'number' && (
                    <div>
                      <span className="text-muted-foreground">Melhoria: </span>
                      <span className="font-mono font-semibold text-blue-600">
                        +{(advance.improvement * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {advance.concepts.map((concept, cIdx) => (
                    <Badge key={cIdx} variant="secondary" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Referências-chave:</h5>
              <div className="flex flex-wrap gap-2">
                {version.keyReferences.map((ref, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

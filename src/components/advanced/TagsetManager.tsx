import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTagsets } from '@/hooks/useTagsets';
import { Loader2 } from 'lucide-react';

export function TagsetManager() {
  const { tagsets, stats, isLoading } = useTagsets();

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <CardTitle>Tagset Semântico</CardTitle>
        <CardDescription>
          {stats.totalTagsets} categorias | {stats.activeTagsets} ativas | {stats.approvedTagsets} aprovadas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {tagsets.map((tagset) => (
            <AccordionItem key={tagset.id} value={tagset.codigo}>
              <AccordionTrigger>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{tagset.codigo}</Badge>
                  <span className="font-semibold">{tagset.nome}</span>
                  {tagset.status === 'ativo' && (
                    <Badge className="bg-green-600 text-xs">Ativo</Badge>
                  )}
                  {tagset.aprovado_por && (
                    <Badge variant="outline" className="text-xs">✓ Aprovado</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-4">
                  {tagset.descricao && (
                    <p className="text-sm text-muted-foreground">{tagset.descricao}</p>
                  )}

                  {tagset.categoria_pai && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">Categoria Pai:</span>
                      <Badge variant="outline" className="ml-2">{tagset.categoria_pai}</Badge>
                    </div>
                  )}

                  {tagset.exemplos && tagset.exemplos.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">Exemplos:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tagset.exemplos.map((ex, i) => (
                          <Badge key={i} variant="secondary" className="font-mono text-xs">
                            {ex}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span>Validações: {tagset.validacoes_humanas}</span>
                    <span>•</span>
                    <span>Criado em: {formatDate(tagset.criado_em)}</span>
                    {tagset.aprovado_em && (
                      <>
                        <span>•</span>
                        <span>Aprovado em: {formatDate(tagset.aprovado_em)}</span>
                      </>
                    )}
                  </div>

                  {!tagset.aprovado_por && (
                    <Button size="sm" variant="outline" className="mt-2">
                      Aprovar Tagset
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

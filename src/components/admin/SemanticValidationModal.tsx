import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HierarchicalTagsetSelector } from './HierarchicalTagsetSelector';
import { POSSelector } from './POSSelector';
import { useNCWordValidation } from '@/hooks/useNCWordValidation';
import { extractKWICContext, KWICResult } from '@/lib/kwicUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { SemanticLexiconEntry } from '@/hooks/useSemanticLexiconData';

interface Props {
  entry: SemanticLexiconEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SemanticValidationModal({ entry, open, onOpenChange, onSuccess }: Props) {
  const [confirmAsCorrect, setConfirmAsCorrect] = useState(false);
  const [selectedTagset, setSelectedTagset] = useState<{ codigo: string; nome: string } | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [aplicarATodas, setAplicarATodas] = useState(true);
  const [selectedPOS, setSelectedPOS] = useState<string | null>(null);
  const [lema, setLema] = useState('');
  const [isMWE, setIsMWE] = useState(false);
  const [mweText, setMweText] = useState('');
  const [isSpellingDeviation, setIsSpellingDeviation] = useState(false);
  const [formaPadrao, setFormaPadrao] = useState('');

  const { submitValidation, isSubmitting } = useNCWordValidation();

  // Pre-populate form when entry changes
  useEffect(() => {
    if (entry && open) {
      setSelectedTagset({ codigo: entry.tagset_codigo, nome: '' });
      setSelectedPOS(entry.pos || null);
      setLema(entry.lema || '');
      setIsMWE(entry.is_mwe || false);
      setMweText(entry.mwe_text || '');
      setIsSpellingDeviation(entry.is_spelling_deviation || false);
      setFormaPadrao(entry.forma_padrao || '');
      setConfirmAsCorrect(false);
      setJustificativa('');
      setAplicarATodas(true);
    }
  }, [entry, open]);

  // Fetch lyrics for KWIC
  const { data: songData, isLoading: loadingSong } = useQuery({
    queryKey: ['song-lyrics-validation', entry?.song_id],
    queryFn: async () => {
      if (!entry?.song_id) return null;
      
      const { data, error } = await supabase
        .from('songs')
        .select('title, lyrics')
        .eq('id', entry.song_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!entry?.song_id && open
  });

  const kwicResults: KWICResult[] = useMemo(() => {
    if (!songData?.lyrics || !entry?.palavra) return [];
    return extractKWICContext(songData.lyrics, entry.palavra, 50);
  }, [songData?.lyrics, entry?.palavra]);

  const handleSave = () => {
    if (!entry) return;

    // If confirming as correct, use existing tagset
    const tagsetToSave = confirmAsCorrect 
      ? { codigo: entry.tagset_codigo, nome: '' }
      : selectedTagset;

    if (!tagsetToSave) return;

    submitValidation({
      palavra: entry.palavra,
      tagset_codigo_novo: tagsetToSave.codigo,
      tagset_nome: tagsetToSave.nome,
      justificativa: confirmAsCorrect 
        ? 'Confirmado como correto via validação humana'
        : (justificativa.trim() || undefined),
      aplicar_a_todas: aplicarATodas,
      contexto_hash: entry.contexto_hash,
      song_id: entry.song_id || undefined,
      pos: selectedPOS || undefined,
      lema: lema.trim() || undefined,
      is_mwe: isMWE,
      mwe_text: isMWE ? mweText.trim() || undefined : undefined,
      is_spelling_deviation: isSpellingDeviation,
      forma_padrao: isSpellingDeviation ? formaPadrao.trim() || undefined : undefined
    }, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setSelectedTagset(null);
    setJustificativa('');
    setAplicarATodas(true);
    setSelectedPOS(null);
    setLema('');
    setIsMWE(false);
    setMweText('');
    setIsSpellingDeviation(false);
    setFormaPadrao('');
    setConfirmAsCorrect(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      resetForm();
    }
  };

  const confidence = entry?.confianca !== null ? Math.round((entry?.confianca || 0) * 100) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✓ Validar: 
            <span className="font-mono text-primary">&quot;{entry?.palavra}&quot;</span>
          </DialogTitle>
          <DialogDescription>
            Confirme ou corrija a classificação semântica desta palavra.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current classification */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Classificação atual</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-mono">
                  {entry?.tagset_codigo}
                </Badge>
                {confidence !== null && (
                  <span className={`text-sm font-medium ${
                    confidence >= 90 ? 'text-green-600' :
                    confidence >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {confidence}% confiança
                  </span>
                )}
                <Badge variant="outline" className="text-xs">
                  {entry?.fonte}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick confirm option */}
          <div className="flex items-center space-x-2 p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
            <Checkbox
              id="confirm-correct"
              checked={confirmAsCorrect}
              onCheckedChange={(checked) => setConfirmAsCorrect(checked === true)}
            />
            <Label
              htmlFor="confirm-correct"
              className="text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Confirmar como correto (validação rápida)
            </Label>
          </div>

          {/* KWIC Context */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">📋 Contexto KWIC</Label>
            {loadingSong ? (
              <div className="flex items-center justify-center py-4 border rounded-lg bg-muted/50">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : kwicResults.length > 0 ? (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30 max-h-32 overflow-y-auto">
                {kwicResults.slice(0, 3).map((kwic, index) => (
                  <div key={index} className="text-sm font-mono leading-relaxed">
                    <span className="text-muted-foreground">{kwic.leftContext}</span>
                    {' '}
                    <span className="font-bold text-primary bg-primary/10 px-1 rounded">
                      [{kwic.keyword}]
                    </span>
                    {' '}
                    <span className="text-muted-foreground">{kwic.rightContext}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Contexto não disponível</span>
              </div>
            )}
          </div>

          {/* Full validation form - only show if not confirming as correct */}
          {!confirmAsCorrect && (
            <>
              {/* Morphological classification */}
              <div className="grid grid-cols-2 gap-3">
                <POSSelector
                  value={selectedPOS}
                  onChange={setSelectedPOS}
                  disabled={isSubmitting}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="lema" className="text-sm">Lema</Label>
                  <Input
                    id="lema"
                    placeholder="Forma canônica"
                    value={lema}
                    onChange={(e) => setLema(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 p-3 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spelling"
                      checked={isSpellingDeviation}
                      onCheckedChange={(checked) => setIsSpellingDeviation(checked === true)}
                    />
                    <Label htmlFor="spelling" className="text-sm cursor-pointer">
                      ✍️ Desvio ortográfico
                    </Label>
                  </div>
                  {isSpellingDeviation && (
                    <Input
                      placeholder="Forma padrão"
                      value={formaPadrao}
                      onChange={(e) => setFormaPadrao(e.target.value)}
                      className="h-8 text-sm"
                    />
                  )}
                </div>

                <div className="space-y-2 p-3 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mwe"
                      checked={isMWE}
                      onCheckedChange={(checked) => setIsMWE(checked === true)}
                    />
                    <Label htmlFor="mwe" className="text-sm cursor-pointer">
                      🔗 Expressão composta (MWE)
                    </Label>
                  </div>
                  {isMWE && (
                    <Input
                      placeholder="Expressão completa"
                      value={mweText}
                      onChange={(e) => setMweText(e.target.value)}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Tagset selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">📂 Domínio Semântico</Label>
                <div className="border rounded-lg p-3 bg-card">
                  <HierarchicalTagsetSelector
                    value={selectedTagset?.codigo || null}
                    onChange={(codigo, nome) => setSelectedTagset({ codigo, nome })}
                  />
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <Label htmlFor="justificativa" className="text-sm">Justificativa (opcional)</Label>
                <Textarea
                  id="justificativa"
                  placeholder="Ex: Reclassificado de X para Y porque..."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </>
          )}

          {/* Apply to all */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aplicar-todas"
              checked={aplicarATodas}
              onCheckedChange={(checked) => setAplicarATodas(checked === true)}
            />
            <Label htmlFor="aplicar-todas" className="text-sm cursor-pointer">
              ☑️ Aplicar a <strong>todas as ocorrências</strong>
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={(!confirmAsCorrect && !selectedTagset) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : confirmAsCorrect ? (
              <>✓ Confirmar como Correto</>
            ) : (
              <>✓ Salvar Validação</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

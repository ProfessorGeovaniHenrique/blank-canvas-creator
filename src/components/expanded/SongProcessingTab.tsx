import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { SongSelector } from "./SongSelector";
import { ProcessedSongResults } from "./ProcessedSongResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ProcessedData {
  semanticDomains: any;
  posStats: any;
  rawText: string;
  metadata: {
    artista: string;
    musica: string;
  };
}

export function SongProcessingTab() {
  const [selectedSong, setSelectedSong] = useState<{ artista: string; musica: string; letra: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleProcess = async () => {
    if (!selectedSong) {
      toast.error("Selecione uma música para processar");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      toast.info("Iniciando processamento...");

      // Call edge function to process song
      setProgress(30);
      const { data, error } = await supabase.functions.invoke('process-single-song', {
        body: {
          letra: selectedSong.letra,
          metadata: {
            artista: selectedSong.artista,
            musica: selectedSong.musica
          }
        }
      });

      if (error) throw error;

      setProgress(90);
      setProcessedData(data);
      setProgress(100);
      
      toast.success("Música processada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao processar música:", error);
      toast.error(error.message || "Erro ao processar música");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processamento Individual de Músicas</CardTitle>
          <CardDescription>
            Selecione uma música do corpus gaúcho para análise completa com POS e Semantic Tagger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SongSelector onSelect={setSelectedSong} />

          {selectedSong && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">{selectedSong.musica}</h4>
              <p className="text-sm text-muted-foreground">{selectedSong.artista}</p>
              <div className="mt-3 max-h-40 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{selectedSong.letra}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleProcess} 
            disabled={!selectedSong || isProcessing}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? "Processando..." : "Processar Música"}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 ? "Preparando..." :
                 progress < 90 ? "Anotando POS e Domínios Semânticos..." :
                 "Finalizando..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {processedData && (
        <ProcessedSongResults data={processedData} />
      )}
    </div>
  );
}

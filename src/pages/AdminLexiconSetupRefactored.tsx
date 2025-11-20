import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, FileText, Copy, Trash2 } from 'lucide-react';
import { MVPHeader } from '@/components/mvp/MVPHeader';
import { MVPFooter } from '@/components/mvp/MVPFooter';
import { AdminBreadcrumb } from '@/components/AdminBreadcrumb';
import { LexiconStatusDashboardRefactored } from '@/components/advanced/lexicon-status/LexiconStatusDashboardRefactored';
import { SystemHealthDashboard } from '@/components/advanced/system-health/SystemHealthDashboard';
import { DictionaryImportInterface } from '@/components/advanced/DictionaryImportInterface';
import { DuplicateAnalysisDashboard } from '@/components/advanced/DuplicateAnalysisDashboard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminLexiconSetupRefactored() {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllDictionaries = async () => {
    setIsClearing(true);
    try {
      const { data, error } = await supabase.functions.invoke('clear-all-dictionaries');
      
      if (error) throw error;
      
      toast.success('✅ Todos os dicionários foram limpos com sucesso');
      queryClient.invalidateQueries({ queryKey: ['lexicon-stats'] });
    } catch (error: any) {
      console.error('Erro ao limpar dicionários:', error);
      toast.error(`❌ Erro: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MVPHeader />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <AdminBreadcrumb currentPage="Configuração de Léxico (Refatorado)" />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dicionários
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ Atenção: Ação Irreversível</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p className="font-semibold text-destructive">
                    Esta ação irá EXCLUIR PERMANENTEMENTE todos os dicionários:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Dicionário Gaúcho (Dialectal)</li>
                    <li>Dicionário Navarro 2014</li>
                    <li>Dicionário UNESP</li>
                    <li>Dicionário Rocha Pombo</li>
                    <li>Dicionário Gutenberg</li>
                  </ul>
                  <p className="text-sm mt-4">
                    Todos os verbetes serão removidos. Esta operação não pode ser desfeita.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllDictionaries}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, Excluir Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <Database className="h-4 w-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger value="health">
              <Activity className="h-4 w-4 mr-2" />
              Health Check
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileText className="h-4 w-4 mr-2" />
              Importação
            </TabsTrigger>
            <TabsTrigger value="duplicates">
              <Copy className="h-4 w-4 mr-2" />
              Duplicatas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <LexiconStatusDashboardRefactored />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="import">
            <DictionaryImportInterface />
          </TabsContent>

          <TabsContent value="duplicates">
            <DuplicateAnalysisDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <MVPFooter />
    </div>
  );
}

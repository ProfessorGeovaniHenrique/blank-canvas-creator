import { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Database, AlertTriangle, TrendingUp, TestTube, BookOpen, Loader2, Award } from 'lucide-react';
import { useSemanticPipelineStats } from '@/hooks/useSemanticPipelineStats';
import { SemanticDomainChart } from '@/components/admin/SemanticDomainChart';
import { AnnotationJobsTable } from '@/components/admin/AnnotationJobsTable';
import { NCCurationPanel } from '@/components/admin/NCCurationPanel';
import { NCWordCorrectionTool } from '@/components/admin/NCWordCorrectionTool';
import { BatchSeedingControl } from '@/components/admin/BatchSeedingControl';
import { DuplicateMonitoringCard } from '@/components/admin/DuplicateMonitoringCard';
import { PipelineTestInterface } from '@/components/admin/PipelineTestInterface';
import { CulturalInsigniaCurationPanel } from '@/components/admin/CulturalInsigniaCurationPanel';
import { SectionErrorBoundary } from '@/components/admin/SectionErrorBoundary';

// Lazy load heavy component
const SemanticLexiconPanel = lazy(() => import('@/components/admin/SemanticLexiconPanel').then(m => ({ default: m.SemanticLexiconPanel })));

export default function AdminSemanticPipeline() {
  const { data: stats, isLoading, refetch } = useSemanticPipelineStats();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div 
            className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" 
            role="status"
            aria-label="Carregando pipeline semântica"
          />
          <p className="text-muted-foreground" aria-hidden="true">Carregando pipeline semântica...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar estatísticas da pipeline</p>
      </div>
    );
  }

  const getSystemStatus = () => {
    const hasNCWords = stats.cacheStats.ncWords > 100;
    const lexiconEmpty = stats.semanticLexicon.status === 'empty';
    const hasActiveJobs = stats.activeJobs.length > 0;

    if (lexiconEmpty || hasNCWords) {
      return { label: '🔴 Crítico', variant: 'destructive' as const };
    }
    if (stats.semanticLexicon.status === 'partial' || !hasActiveJobs) {
      return { label: '🟡 Degradado', variant: 'secondary' as const };
    }
    return { label: '🟢 Operacional', variant: 'default' as const };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Anotação Semântica</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do sistema de classificação semântica
          </p>
        </div>
        <Badge variant={systemStatus.variant} className="text-lg px-4 py-2">
          {systemStatus.label}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-1 md:gap-2" aria-label="Dashboard">
            <Database className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="lexicon" className="gap-1 md:gap-2" aria-label="Léxico Anotado">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Léxico Anotado</span>
          </TabsTrigger>
          <TabsTrigger value="insignias" className="gap-1 md:gap-2" aria-label="Insígnias Culturais">
            <Award className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Insígnias</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1 md:gap-2" aria-label="Teste de Pipeline">
            <TestTube className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Teste</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">

          {/* Main Stats Grid - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Estatísticas Principais" 
            sectionId="stats-grid"
            severity="high"
            fallbackHeight="min-h-[180px]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">Cache Coverage</h2>
                  <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.cacheStats.totalWords.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    palavras únicas no cache
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.cacheStats.uniqueTagsets} domínios semânticos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">Semantic Lexicon</h2>
                  <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.semanticLexicon.totalEntries.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    entradas pré-classificadas
                  </p>
                  <Badge 
                    variant={stats.semanticLexicon.status === 'empty' ? 'destructive' : 'secondary'}
                    className="mt-2"
                  >
                    {stats.semanticLexicon.status === 'empty' ? '⚠️ Vazio' :
                     stats.semanticLexicon.status === 'partial' ? '🟡 Parcial' : '✅ Completo'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">NC Words</h2>
                  <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {stats.cacheStats.ncWords.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    palavras não classificadas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.cacheStats.totalWords > 0 
                      ? ((stats.cacheStats.ncWords / stats.cacheStats.totalWords) * 100).toFixed(1)
                      : '0.0'}% do cache
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">Confidence</h2>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.cacheStats.avgConfidence * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    confiança média global
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gemini: {stats.cacheStats.geminiPercentage.toFixed(1)}% | 
                    POS: {stats.cacheStats.posBasedPercentage.toFixed(1)}% |
                    Rules: {stats.cacheStats.ruleBasedPercentage.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">Léxico Semântico</h2>
                  <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.semanticLexicon.totalEntries.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    entradas no léxico
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: {stats.semanticLexicon.status === 'complete' ? '✅ Completo' : 
                             stats.semanticLexicon.status === 'partial' ? '🔄 Parcial' : '❌ Vazio'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-sm font-medium tracking-tight">Cultural Insignias</h2>
                  <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.cacheStats.wordsWithInsignias || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    palavras com marcadores culturais
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Polissêmicas: {stats.cacheStats.polysemousWords || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </SectionErrorBoundary>

          {/* Active Jobs - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Jobs de Anotação" 
            sectionId="annotation-jobs"
            severity="high"
            fallbackHeight="min-h-[300px]"
          >
            <AnnotationJobsTable jobs={stats.activeJobs} onRefresh={refetch} />
          </SectionErrorBoundary>

          {/* Domain Distribution - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Distribuição de Domínios" 
            sectionId="domain-chart"
            severity="medium"
            fallbackHeight="min-h-[400px]"
          >
            <SemanticDomainChart data={stats.domainDistribution} />
          </SectionErrorBoundary>

          {/* Batch Seeding Control - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Batch Seeding" 
            sectionId="batch-seeding"
            severity="medium"
            fallbackHeight="min-h-[200px]"
          >
            <BatchSeedingControl 
              semanticLexiconCount={stats.semanticLexicon.totalEntries}
              status={stats.semanticLexicon.status}
            />
          </SectionErrorBoundary>

          {/* Duplicate Monitoring - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Monitoramento de Duplicatas" 
            sectionId="duplicate-monitoring"
            severity="low"
            fallbackHeight="min-h-[150px]"
          >
            <DuplicateMonitoringCard />
          </SectionErrorBoundary>

          {/* NC Words Panel - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Curadoria NC" 
            sectionId="nc-curation"
            severity="high"
            fallbackHeight="min-h-[400px]"
          >
            <NCCurationPanel />
          </SectionErrorBoundary>

          {/* NC Word Correction Tool - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Correção de Palavras NC" 
            sectionId="nc-correction"
            severity="medium"
            fallbackHeight="min-h-[200px]"
          >
            <NCWordCorrectionTool />
          </SectionErrorBoundary>

          {/* System Health Summary - Wrapped */}
          <SectionErrorBoundary 
            sectionName="Saúde do Sistema" 
            sectionId="system-health"
            severity="low"
            fallbackHeight="min-h-[200px]"
          >
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold leading-none tracking-tight">Resumo de Saúde do Sistema</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status Geral</span>
                  <Badge variant={systemStatus.variant}>{systemStatus.label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-Refresh</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Ativo (30s)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Última Atualização</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jobs Ativos</span>
                  <Badge variant={stats.activeJobs.length > 0 ? 'default' : 'secondary'}>
                    {stats.activeJobs.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taxa de Classificação Gemini</span>
                  <span className="text-sm font-medium">
                    {stats.cacheStats.geminiPercentage.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="lexicon" className="mt-6">
          <SectionErrorBoundary 
            sectionName="Léxico Semântico" 
            sectionId="semantic-lexicon"
            severity="critical"
            fallbackHeight="min-h-[500px]"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" role="status" aria-label="Carregando léxico" />
              </div>
            }>
              <SemanticLexiconPanel />
            </Suspense>
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="insignias" className="mt-6">
          <SectionErrorBoundary 
            sectionName="Insígnias Culturais" 
            sectionId="cultural-insignias"
            severity="high"
            fallbackHeight="min-h-[500px]"
          >
            <CulturalInsigniaCurationPanel />
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <SectionErrorBoundary 
            sectionName="Teste de Pipeline" 
            sectionId="pipeline-test"
            severity="low"
            fallbackHeight="min-h-[400px]"
          >
            <PipelineTestInterface />
          </SectionErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}

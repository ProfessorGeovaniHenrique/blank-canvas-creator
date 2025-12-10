import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useThroughputMetrics } from '@/hooks/useThroughputMetrics';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Zap, 
  Clock, Activity, CheckCircle2, XCircle 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

interface SparklineCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
}

function SparklineCard({ title, value, subtitle, trend, trendValue, icon }: SparklineCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue && <span className="text-xs">{trendValue}</span>}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ThroughputDashboard() {
  const metrics = useThroughputMetrics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshMV = async () => {
    setIsRefreshing(true);
    try {
      await metrics.refreshMV();
      toast.success('Métricas atualizadas');
    } catch (err) {
      toast.error('Erro ao atualizar métricas');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (metrics.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  // Prepare chart data
  const historyChartData = metrics.history.map(p => ({
    time: format(p.periodStart, 'HH:mm', { locale: ptBR }),
    processadas: p.songsProcessed,
    sucesso: p.songsEnriched,
    erro: p.songsFailed,
  }));

  const corpusChartData = metrics.corpusRates.map(c => ({
    name: c.corpusName,
    rate: c.rate,
    total: c.processed24h,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Throughput</h2>
          <p className="text-muted-foreground">
            Taxa de processamento do pipeline de enriquecimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Última atividade: {metrics.lastActivity 
              ? formatDistanceToNow(metrics.lastActivity, { addSuffix: true, locale: ptBR })
              : 'Nenhuma'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshMV}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SparklineCard
          title="Taxa Atual"
          value={`${metrics.currentRate}/h`}
          subtitle="músicas por hora"
          icon={<Zap className="h-4 w-4 text-amber-500" />}
        />
        <SparklineCard
          title="Média 24h"
          value={`${metrics.averageRate}/h`}
          trend={metrics.rateChangeTrend}
          trendValue={`${metrics.rateChange24h > 0 ? '+' : ''}${metrics.rateChange24h}%`}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <SparklineCard
          title="Pico 24h"
          value={`${metrics.peakRate}/h`}
          subtitle="máximo registrado"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        <SparklineCard
          title="Total 24h"
          value={metrics.totalProcessed24h.toLocaleString('pt-BR')}
          subtitle={`${metrics.totalEnriched24h} sucesso / ${metrics.totalFailed24h} erro`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Processamento</CardTitle>
            <CardDescription>Últimas 24 horas por hora</CardDescription>
          </CardHeader>
          <CardContent>
            {historyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={historyChartData}>
                  <defs>
                    <linearGradient id="colorProcessadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="processadas" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorProcessadas)" 
                    name="Processadas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Sem dados de histórico
              </div>
            )}
          </CardContent>
        </Card>

        {/* Corpus Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput por Corpus</CardTitle>
            <CardDescription>Taxa média e total processado</CardDescription>
          </CardHeader>
          <CardContent>
            {corpusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={corpusChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="rate" 
                    fill="hsl(var(--primary))" 
                    name="Taxa/h" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Sem dados por corpus
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Corpus Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Corpus</CardTitle>
          <CardDescription>Status de processamento nas últimas 24h</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.corpusRates.length > 0 ? (
            <div className="space-y-4">
              {metrics.corpusRates.map(corpus => (
                <div key={corpus.corpusId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      corpus.trend === 'up' ? 'bg-green-500/10' : 
                      corpus.trend === 'down' ? 'bg-red-500/10' : 'bg-muted'
                    }`}>
                      {corpus.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : corpus.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{corpus.corpusName}</p>
                      <p className="text-sm text-muted-foreground">
                        {corpus.processed24h.toLocaleString('pt-BR')} músicas processadas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{corpus.rate}/h</p>
                    <Badge variant={
                      corpus.trend === 'up' ? 'default' : 
                      corpus.trend === 'down' ? 'destructive' : 'secondary'
                    }>
                      {corpus.trend === 'up' ? 'Acelerando' : 
                       corpus.trend === 'down' ? 'Desacelerando' : 'Estável'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum corpus com atividade nas últimas 24h
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

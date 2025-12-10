import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ThroughputPeriod {
  periodStart: Date;
  corpusId: string | null;
  songsProcessed: number;
  songsEnriched: number;
  songsFailed: number;
  avgConfidence: number;
  lastActivity: Date | null;
}

interface CorpusRate {
  corpusId: string;
  corpusName: string;
  rate: number; // songs/hour
  trend: 'up' | 'down' | 'stable';
  processed24h: number;
}

export interface ThroughputMetrics {
  currentRate: number;           // songs/hour last period
  averageRate: number;           // avg 24h
  peakRate: number;              // peak 24h
  rateChange24h: number;         // % change vs yesterday
  rateChangeTrend: 'up' | 'down' | 'stable';
  corpusRates: CorpusRate[];
  history: ThroughputPeriod[];
  totalProcessed24h: number;
  totalEnriched24h: number;
  totalFailed24h: number;
  lastActivity: Date | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  refreshMV: () => Promise<void>;
}

const CORPUS_NAMES: Record<string, string> = {
  '1e7256cd-5adf-4196-85f9-4af7031f098a': 'Nordestino',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479': 'Gaúcho',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'Sertanejo',
};

export function useThroughputMetrics(): ThroughputMetrics {
  const queryClient = useQueryClient();
  const [lastRefreshMV, setLastRefreshMV] = useState<Date | null>(null);

  // Query MV data
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['enrichment-throughput-mv'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrichment_throughput_mv')
        .select('*')
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data as Array<{
        period_start: string;
        corpus_id: string | null;
        songs_processed: number;
        songs_enriched: number;
        songs_failed: number;
        avg_confidence: number;
        last_activity: string | null;
      }>;
    },
    refetchInterval: 30000, // 30s refresh
    staleTime: 15000,
  });

  // Setup Realtime subscription for songs table updates
  useEffect(() => {
    const channel = supabase
      .channel('throughput-songs-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'songs',
          filter: 'status=in.(enriched,error)',
        },
        () => {
          // Invalidate query on song status change
          queryClient.invalidateQueries({ queryKey: ['enrichment-throughput-mv'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Process raw data into metrics
  const metrics = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        currentRate: 0,
        averageRate: 0,
        peakRate: 0,
        rateChange24h: 0,
        rateChangeTrend: 'stable' as const,
        corpusRates: [],
        history: [],
        totalProcessed24h: 0,
        totalEnriched24h: 0,
        totalFailed24h: 0,
        lastActivity: null,
      };
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Convert to typed periods
    const periods: ThroughputPeriod[] = rawData.map(row => ({
      periodStart: new Date(row.period_start),
      corpusId: row.corpus_id,
      songsProcessed: row.songs_processed || 0,
      songsEnriched: row.songs_enriched || 0,
      songsFailed: row.songs_failed || 0,
      avgConfidence: row.avg_confidence || 0,
      lastActivity: row.last_activity ? new Date(row.last_activity) : null,
    }));

    // Last 24h data
    const last24h = periods.filter(p => p.periodStart >= twentyFourHoursAgo);
    
    // Previous 24h data (for comparison)
    const previous24h = periods.filter(
      p => p.periodStart >= fortyEightHoursAgo && p.periodStart < twentyFourHoursAgo
    );

    // Aggregate by hour for current rate (last complete hour)
    const hourlyRates = last24h.reduce((acc, p) => {
      const hour = p.periodStart.toISOString();
      if (!acc[hour]) acc[hour] = 0;
      acc[hour] += p.songsProcessed;
      return acc;
    }, {} as Record<string, number>);

    const hourlyValues = Object.values(hourlyRates);
    const currentRate = hourlyValues[0] || 0; // Most recent hour
    const averageRate = hourlyValues.length > 0 
      ? hourlyValues.reduce((a, b) => a + b, 0) / hourlyValues.length 
      : 0;
    const peakRate = Math.max(...hourlyValues, 0);

    // 24h totals
    const totalProcessed24h = last24h.reduce((sum, p) => sum + p.songsProcessed, 0);
    const totalEnriched24h = last24h.reduce((sum, p) => sum + p.songsEnriched, 0);
    const totalFailed24h = last24h.reduce((sum, p) => sum + p.songsFailed, 0);

    // Previous 24h total for comparison
    const previousTotal = previous24h.reduce((sum, p) => sum + p.songsProcessed, 0);
    const rateChange24h = previousTotal > 0 
      ? ((totalProcessed24h - previousTotal) / previousTotal) * 100 
      : 0;
    const rateChangeTrend: 'up' | 'down' | 'stable' = 
      rateChange24h > 5 ? 'up' : rateChange24h < -5 ? 'down' : 'stable';

    // Corpus rates
    const corpusData = last24h.reduce((acc, p) => {
      const corpusId = p.corpusId || 'unknown';
      if (!acc[corpusId]) {
        acc[corpusId] = { processed: 0, hours: new Set<string>() };
      }
      acc[corpusId].processed += p.songsProcessed;
      acc[corpusId].hours.add(p.periodStart.toISOString());
      return acc;
    }, {} as Record<string, { processed: number; hours: Set<string> }>);

    const corpusRates: CorpusRate[] = Object.entries(corpusData).map(([corpusId, data]) => {
      const hoursCount = data.hours.size || 1;
      const rate = data.processed / hoursCount;
      
      // Calculate trend (simplified)
      const trend: 'up' | 'down' | 'stable' = rate > averageRate ? 'up' : rate < averageRate * 0.5 ? 'down' : 'stable';
      
      return {
        corpusId,
        corpusName: CORPUS_NAMES[corpusId] || 'Desconhecido',
        rate: Math.round(rate * 10) / 10,
        trend,
        processed24h: data.processed,
      };
    });

    // Last activity
    const lastActivity = periods.length > 0 && periods[0].lastActivity
      ? periods[0].lastActivity
      : null;

    // History for chart (aggregate by hour, all corpora)
    const historyMap = new Map<string, ThroughputPeriod>();
    last24h.forEach(p => {
      const key = p.periodStart.toISOString();
      const existing = historyMap.get(key);
      if (existing) {
        existing.songsProcessed += p.songsProcessed;
        existing.songsEnriched += p.songsEnriched;
        existing.songsFailed += p.songsFailed;
      } else {
        historyMap.set(key, { ...p });
      }
    });
    const history = Array.from(historyMap.values()).sort(
      (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
    );

    return {
      currentRate: Math.round(currentRate),
      averageRate: Math.round(averageRate * 10) / 10,
      peakRate: Math.round(peakRate),
      rateChange24h: Math.round(rateChange24h * 10) / 10,
      rateChangeTrend,
      corpusRates,
      history,
      totalProcessed24h,
      totalEnriched24h,
      totalFailed24h,
      lastActivity,
    };
  }, [rawData]);

  // Refresh MV function
  const refreshMV = async () => {
    try {
      const { error } = await supabase.rpc('refresh_enrichment_throughput_mv');
      if (error) throw error;
      setLastRefreshMV(new Date());
      await refetch();
    } catch (err) {
      console.error('[useThroughputMetrics] Erro ao atualizar MV:', err);
      throw err;
    }
  };

  return {
    ...metrics,
    isLoading,
    error: error as Error | null,
    refresh: () => refetch(),
    refreshMV,
  };
}

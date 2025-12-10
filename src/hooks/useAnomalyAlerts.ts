import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AnomalyAlert {
  id: string;
  checkName: string;
  anomalyType: 'throughput' | 'error_rate' | 'latency' | 'quota';
  severity: 'info' | 'warning' | 'critical';
  expectedValue: number;
  actualValue: number;
  deviationScore: number;
  context: Record<string, unknown>;
  detectedAt: Date;
  resolvedAt: Date | null;
  acknowledgedBy: string | null;
  acknowledgedAt: Date | null;
  resolutionNotes: string | null;
  autoResolved: boolean;
  
  // UI helpers
  formattedMessage: string;
  actionRequired: boolean;
  suggestedAction: string;
}

interface UseAnomalyAlertsReturn {
  alerts: AnomalyAlert[];
  activeAlerts: AnomalyAlert[];
  criticalCount: number;
  warningCount: number;
  isLoading: boolean;
  error: Error | null;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string, notes: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  refresh: () => void;
}

const ANOMALY_MESSAGES: Record<string, { message: string; action: string }> = {
  throughput_drop: {
    message: 'Taxa de processamento caiu significativamente',
    action: 'Verificar status das edge functions e conexão com APIs externas',
  },
  error_spike: {
    message: 'Taxa de erro acima do normal',
    action: 'Verificar logs de erro e status dos serviços externos',
  },
  latency_degradation: {
    message: 'Latência das funções degradada',
    action: 'Verificar carga do sistema e otimizar queries lentas',
  },
  quota_warning: {
    message: 'Quota de API próxima do limite',
    action: 'Reduzir taxa de requisições ou aumentar quota',
  },
};

export function useAnomalyAlerts(): UseAnomalyAlertsReturn {
  const queryClient = useQueryClient();
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Query alerts
  const { data: rawAlerts, isLoading, error, refetch } = useQuery({
    queryKey: ['anomaly-detections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anomaly_detections')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // 1min fallback refresh
    staleTime: 30000,
  });

  // Setup Realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    const channel = supabase
      .channel('anomaly-detections-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anomaly_detections',
        },
        (payload) => {
          console.log('[useAnomalyAlerts] Realtime update:', payload.eventType);
          
          // Show toast for new critical alerts
          if (payload.eventType === 'INSERT' && payload.new) {
            const newAlert = payload.new as { severity: string; check_name: string };
            if (newAlert.severity === 'critical') {
              toast.error('🚨 Anomalia Crítica Detectada', {
                description: ANOMALY_MESSAGES[newAlert.check_name]?.message || newAlert.check_name,
                duration: 10000,
              });
            } else if (newAlert.severity === 'warning') {
              toast.warning('⚠️ Anomalia Detectada', {
                description: ANOMALY_MESSAGES[newAlert.check_name]?.message || newAlert.check_name,
                duration: 5000,
              });
            }
          }
          
          queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, realtimeEnabled]);

  // Transform raw data to typed alerts
  const alerts: AnomalyAlert[] = (rawAlerts || []).map(row => {
    const checkName = row.check_name as string;
    const messageInfo = ANOMALY_MESSAGES[checkName] || { 
      message: checkName, 
      action: 'Verificar sistema' 
    };

    return {
      id: row.id,
      checkName,
      anomalyType: row.anomaly_type as AnomalyAlert['anomalyType'],
      severity: row.severity as AnomalyAlert['severity'],
      expectedValue: row.expected_value || 0,
      actualValue: row.actual_value || 0,
      deviationScore: row.deviation_score || 0,
      context: (row.context as Record<string, unknown>) || {},
      detectedAt: new Date(row.detected_at),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : null,
      resolutionNotes: row.resolution_notes,
      autoResolved: row.auto_resolved || false,
      formattedMessage: messageInfo.message,
      actionRequired: row.severity === 'critical' && !row.resolved_at,
      suggestedAction: messageInfo.action,
    };
  });

  const activeAlerts = alerts.filter(a => !a.resolvedAt);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  // Acknowledge mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('anomaly_detections')
        .update({ 
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
      toast.success('Alerta reconhecido');
    },
    onError: (err) => {
      toast.error('Erro ao reconhecer alerta', { description: String(err) });
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('anomaly_detections')
        .update({ 
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
      toast.success('Alerta resolvido');
    },
    onError: (err) => {
      toast.error('Erro ao resolver alerta', { description: String(err) });
    },
  });

  // Auto-dismiss (mark as resolved without notes)
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('anomaly_detections')
        .update({ 
          resolved_at: new Date().toISOString(),
          auto_resolved: true,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
    },
  });

  return {
    alerts,
    activeAlerts,
    criticalCount,
    warningCount,
    isLoading,
    error: error as Error | null,
    acknowledgeAlert: (id) => acknowledgeMutation.mutateAsync(id),
    resolveAlert: (id, notes) => resolveMutation.mutateAsync({ id, notes }),
    dismissAlert: (id) => dismissMutation.mutateAsync(id),
    refresh: () => refetch(),
  };
}

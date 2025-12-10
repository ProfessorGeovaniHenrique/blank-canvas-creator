/**
 * Hook centralizado para controlar polling de jobs de enriquecimento
 * Evita múltiplos timers causando re-renders em cascata
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeartbeatState {
  hasActiveJobs: boolean;
  lastTick: number;
  tickCount: number;
}

interface UseEnrichmentHeartbeatOptions {
  activeInterval?: number;  // ms quando há jobs ativos (default: 5000)
  idleInterval?: number;    // ms quando não há jobs ativos (default: 60000)
  enabled?: boolean;
}

const DEBOUNCE_MS = 3000; // Mínimo entre fetches

export function useEnrichmentHeartbeat(options: UseEnrichmentHeartbeatOptions = {}) {
  const {
    activeInterval = 5000,
    idleInterval = 60000,
    enabled = true
  } = options;

  const [state, setState] = useState<HeartbeatState>({
    hasActiveJobs: false,
    lastTick: Date.now(),
    tickCount: 0
  });

  const lastCheckRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verifica se há jobs ativos com debounce
  const checkActiveJobs = useCallback(async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < DEBOUNCE_MS) {
      return; // Skip se verificou há menos de 3s
    }
    lastCheckRef.current = now;

    try {
      const { count: enrichmentCount } = await supabase
        .from('enrichment_jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['processando', 'pausado']);

      const { count: processingCount } = await supabase
        .from('processing_jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['processando', 'pausado']);

      const hasActive = (enrichmentCount || 0) > 0 || (processingCount || 0) > 0;

      setState(prev => ({
        hasActiveJobs: hasActive,
        lastTick: now,
        tickCount: prev.tickCount + 1
      }));
    } catch (err) {
      console.error('[Heartbeat] Erro ao verificar jobs:', err);
    }
  }, []);

  // Setup interval baseado no estado
  useEffect(() => {
    if (!enabled) return;

    // Check inicial
    checkActiveJobs();

    // Limpar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Criar novo interval baseado no estado
    const interval = state.hasActiveJobs ? activeInterval : idleInterval;
    intervalRef.current = setInterval(checkActiveJobs, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, state.hasActiveJobs, activeInterval, idleInterval, checkActiveJobs]);

  // Força um tick manual
  const forceTick = useCallback(() => {
    lastCheckRef.current = 0; // Reset debounce
    checkActiveJobs();
  }, [checkActiveJobs]);

  return {
    hasActiveJobs: state.hasActiveJobs,
    lastTick: state.lastTick,
    tickCount: state.tickCount,
    forceTick,
    currentInterval: state.hasActiveJobs ? activeInterval : idleInterval
  };
}

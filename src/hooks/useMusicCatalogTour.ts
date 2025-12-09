/**
 * 🎯 TOUR GUIADO - CATÁLOGO DE MÚSICAS
 * Sprint CAT-AUDIT-P3 - Onboarding com Shepherd.js
 * 
 * Tour interativo para guiar professores/usuários
 * pelas funcionalidades do catálogo musical
 * 
 * CORREÇÃO: Adicionado waitForElement e beforeShowPromise
 * para elementos dinâmicos que podem não estar no DOM
 */

import { useEffect, useRef, useCallback } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface TourOptions {
  autoStart?: boolean;
  onComplete?: () => void;
  onTabChange?: (tab: string) => void;
}

const TOUR_STORAGE_KEY = 'music_catalog_tour_completed';

/**
 * Helper para aguardar elemento aparecer no DOM
 */
const waitForElement = (selector: string, timeout = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    // Se já existe, retorna imediatamente
    if (document.querySelector(selector)) {
      return resolve(true);
    }
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(true);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Timeout de segurança
    setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
};

/**
 * Verifica se elemento existe no DOM
 */
const elementExists = (selector: string): boolean => {
  return !!document.querySelector(selector);
};

export function useMusicCatalogTour(options: TourOptions = {}) {
  const tourRef = useRef<typeof Shepherd.Tour.prototype | null>(null);
  const { onTabChange } = options;

  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      }
    });

    // Passo 1: Boas-vindas (sem elemento - sempre aparece)
    tour.addStep({
      id: 'welcome',
      title: '👋 Bem-vindo ao Catálogo Musical',
      text: `
        <p>Este tour vai te mostrar como explorar e gerenciar o catálogo de músicas do <strong>VersoAustral</strong>.</p>
        <p class="mt-2">Vamos conhecer as principais funcionalidades!</p>
      `,
      buttons: [
        { text: 'Pular Tour', action: tour.cancel, secondary: true },
        { text: 'Começar', action: tour.next }
      ]
    });

    // Passo 2: Busca Inteligente
    tour.addStep({
      id: 'search',
      title: '🔍 Busca Inteligente',
      text: `
        <p>Use a <strong>barra de busca</strong> para encontrar artistas e músicas rapidamente.</p>
        <p class="mt-2">A busca oferece sugestões automáticas enquanto você digita!</p>
      `,
      attachTo: { element: '[data-tour="search-autocomplete"]', on: 'bottom' },
      beforeShowPromise: () => waitForElement('[data-tour="search-autocomplete"]', 2000),
      buttons: [
        { text: 'Voltar', action: tour.back, secondary: true },
        { text: 'Próximo', action: tour.next }
      ]
    });

    // Passo 3: Filtro Alfabético (requer aba Artistas)
    tour.addStep({
      id: 'alphabet-filter',
      title: '🔤 Filtro Alfabético',
      text: `
        <p>Clique em uma <strong>letra</strong> para filtrar artistas por inicial.</p>
        <p class="mt-2">Use as teclas ← → para navegar e Enter para selecionar.</p>
      `,
      attachTo: { element: '[data-tour="alphabet-filter"]', on: 'bottom' },
      beforeShowPromise: async () => {
        // Mudar para aba Artistas se não estiver
        onTabChange?.('artists');
        // Aguardar elemento aparecer
        const found = await waitForElement('[data-tour="alphabet-filter"]', 3000);
        if (!found) {
          // Se não encontrou, pular para próximo passo
          tour.next();
          return false;
        }
        return true;
      },
      buttons: [
        { text: 'Voltar', action: tour.back, secondary: true },
        { text: 'Próximo', action: tour.next }
      ]
    });

    // Passo 4: Cartão do Artista (requer aba Artistas com dados)
    tour.addStep({
      id: 'artist-card',
      title: '🎤 Cartão do Artista',
      text: `
        <p>Cada cartão mostra <strong>estatísticas</strong> do artista:</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li>• Total de músicas no catálogo</li>
          <li>• Músicas pendentes de enriquecimento</li>
          <li>• Barra de progresso de completude</li>
        </ul>
      `,
      attachTo: { element: '[data-tour="artist-card"]', on: 'right' },
      beforeShowPromise: async () => {
        // Garantir aba Artistas
        onTabChange?.('artists');
        const found = await waitForElement('[data-tour="artist-card"]', 3000);
        if (!found) {
          // Se não encontrou artistas, mostrar mensagem alternativa
          return false;
        }
        return true;
      },
      when: {
        show: () => {
          // Verificar se elemento existe ao mostrar
          if (!elementExists('[data-tour="artist-card"]')) {
            tour.next();
          }
        }
      },
      buttons: [
        { text: 'Voltar', action: tour.back, secondary: true },
        { text: 'Próximo', action: tour.next }
      ]
    });

    // Passo 5: Botão Analisar
    tour.addStep({
      id: 'analyze-button',
      title: '🔬 Analisar Corpus',
      text: `
        <p>Clique em <strong>Analisar Corpus</strong> para ir às ferramentas de análise estilística.</p>
        <p class="mt-2">Lá você pode explorar domínios semânticos, estatísticas e visualizações!</p>
      `,
      attachTo: { element: '[data-tour="analyze-corpus-button"]', on: 'bottom' },
      beforeShowPromise: () => waitForElement('[data-tour="analyze-corpus-button"]', 2000),
      when: {
        show: () => {
          if (!elementExists('[data-tour="analyze-corpus-button"]')) {
            tour.next();
          }
        }
      },
      buttons: [
        { text: 'Voltar', action: tour.back, secondary: true },
        { text: 'Próximo', action: tour.next }
      ]
    });

    // Passo 6: Abas do Catálogo
    tour.addStep({
      id: 'tabs',
      title: '📑 Navegação por Abas',
      text: `
        <p>O catálogo possui várias <strong>abas</strong>:</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li>• <strong>Artistas</strong>: Lista de todos os artistas</li>
          <li>• <strong>Músicas</strong>: Visualização das músicas</li>
          <li>• <strong>Métricas</strong>: Estatísticas do catálogo</li>
          <li>• <strong>Jobs</strong>: Gerenciamento de processamentos</li>
        </ul>
      `,
      attachTo: { element: '[data-tour="catalog-tabs"]', on: 'bottom' },
      beforeShowPromise: () => waitForElement('[data-tour="catalog-tabs"]', 2000),
      buttons: [
        { text: 'Voltar', action: tour.back, secondary: true },
        { text: 'Finalizar', action: tour.complete }
      ]
    });

    // Evento de conclusão
    tour.on('complete', () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      options.onComplete?.();
    });

    // Evento de cancelamento também marca como visto
    tour.on('cancel', () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    });

    tourRef.current = tour;

    // Auto-start se solicitado e não foi completado antes
    if (options.autoStart) {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompleted) {
        // Aumentar delay para garantir que dados carregaram
        setTimeout(() => {
          // Verificar se pelo menos toolbar existe
          if (elementExists('[data-tour="search-autocomplete"]') || 
              elementExists('[data-tour="catalog-tabs"]')) {
            tour.start();
          }
        }, 2500);
      }
    }

    return () => {
      tour.cancel();
    };
  }, [options.autoStart, options.onComplete, onTabChange]);

  const startTour = useCallback(() => {
    tourRef.current?.start();
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    tourRef.current?.start();
  }, []);

  const hasCompletedTour = useCallback(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  }, []);

  return {
    startTour,
    resetTour,
    hasCompletedTour,
    tour: tourRef.current
  };
}

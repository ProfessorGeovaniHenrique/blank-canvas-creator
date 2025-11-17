import { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function useStatisticsTour(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-academic',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true
        }
      }
    });

    // Passo 1: Introdução
    tour.addStep({
      id: 'intro',
      title: 'Aba de Estatísticas 📊',
      text: `Bem-vindo à análise estatística completa! Esta aba apresenta métricas linguísticas avançadas, 
             incluindo palavras-chave, prosódia semântica e visualizações interativas.`,
      attachTo: {
        element: '[data-tour="stats-header"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Próximo',
          action: tour.next
        }
      ]
    });

    // Passo 2: Tabela Interativa
    tour.addStep({
      id: 'table',
      title: 'Tabela de Palavras-chave 📋',
      text: `Esta tabela mostra todas as palavras-chave identificadas com suas métricas estatísticas:
             <ul style="margin-top: 8px; padding-left: 20px;">
               <li><strong>LL (Log-Likelihood)</strong>: Medida de keyness estatística</li>
               <li><strong>MI (Mutual Information)</strong>: Força de associação com o corpus</li>
               <li><strong>Domínio Semântico</strong>: Categoria temática da palavra</li>
               <li><strong>Prosódia</strong>: Sentimento (Positiva/Negativa/Neutra)</li>
             </ul>`,
      attachTo: {
        element: '[data-tour="stats-table"]',
        on: 'top'
      },
      buttons: [
        {
          text: 'Voltar',
          action: tour.back
        },
        {
          text: 'Próximo',
          action: tour.next
        }
      ]
    });

    // Passo 3: Filtros
    tour.addStep({
      id: 'filters',
      title: 'Filtros de Análise 🔍',
      text: `Use os filtros para refinar sua análise:
             <ul style="margin-top: 8px; padding-left: 20px;">
               <li><strong>Busca por palavra</strong>: Encontre termos específicos</li>
               <li><strong>Domínio Semântico</strong>: Filtre por categoria temática</li>
               <li><strong>Prosódia</strong>: Selecione palavras por sentimento</li>
               <li><strong>Ranges</strong>: Ajuste frequência, LL e MI</li>
             </ul>
             <p style="margin-top: 8px;"><em>Dica: Clique em "Filtros Avançados" para mais opções!</em></p>`,
      attachTo: {
        element: '[data-tour="stats-filters"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Voltar',
          action: tour.back
        },
        {
          text: 'Próximo',
          action: tour.next
        }
      ]
    });

    // Passo 4: Gráficos
    tour.addStep({
      id: 'charts',
      title: 'Visualizações Estatísticas 📈',
      text: `Explore os dados através de três visualizações complementares:
             <ul style="margin-top: 8px; padding-left: 20px;">
               <li><strong>Distribuição Textual</strong>: Ocorrências por domínio semântico</li>
               <li><strong>Análise de Prosódia</strong>: Proporção de sentimentos (Positiva/Negativa/Neutra)</li>
               <li><strong>Keyness Estatística</strong>: Scatter plot LL vs MI com cores por domínio</li>
             </ul>
             <p style="margin-top: 8px;"><em>Cada gráfico revela padrões diferentes no corpus!</em></p>`,
      attachTo: {
        element: '[data-tour="stats-charts"]',
        on: 'top'
      },
      buttons: [
        {
          text: 'Voltar',
          action: tour.back
        },
        {
          text: 'Próximo',
          action: tour.next
        }
      ]
    });

    // Passo 5: Ordenação
    tour.addStep({
      id: 'sorting',
      title: 'Ordenação de Dados 🔄',
      text: `Clique nos cabeçalhos das colunas para ordenar os dados. A ordenação funciona em três estados:
             <ol style="margin-top: 8px; padding-left: 20px;">
               <li><strong>Descendente</strong> (↓): Maiores valores primeiro</li>
               <li><strong>Ascendente</strong> (↑): Menores valores primeiro</li>
               <li><strong>Sem ordenação</strong>: Ordem original</li>
             </ol>`,
      attachTo: {
        element: '[data-tour="stats-sorting"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Voltar',
          action: tour.back
        },
        {
          text: 'Próximo',
          action: tour.next
        }
      ]
    });

    // Passo 6: Conclusão
    tour.addStep({
      id: 'conclusion',
      title: 'Pronto para Analisar! ✅',
      text: `Você agora conhece todas as ferramentas disponíveis na aba de Estatísticas. 
             <p style="margin-top: 8px;">Use-as para explorar padrões linguísticos, identificar palavras-chave 
             e compreender a estrutura semântica do corpus gaúcho.</p>
             <p style="margin-top: 8px;"><strong>Dica:</strong> Combine filtros e gráficos para análises mais profundas!</p>`,
      buttons: [
        {
          text: 'Voltar',
          action: tour.back
        },
        {
          text: 'Concluir Tour',
          action: tour.complete
        }
      ]
    });

    return () => {
      tour.complete();
    };
  }, [enabled]);

  return null;
}

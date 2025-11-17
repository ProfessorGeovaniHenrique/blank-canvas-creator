import { constructionLog } from "@/data/developer-logs";
import type { UpdateResult } from "@/hooks/useHistoryUpdate";

export async function scanProjectStatus(): Promise<UpdateResult> {
  // Simular scan de arquivos (em produção, seria via edge function)
  // Por ora, usamos valores estimados baseados na estrutura do projeto
  
  const previousSnapshot = localStorage.getItem('dev-history-snapshot');
  const previous = previousSnapshot ? JSON.parse(previousSnapshot) : null;

  // Valores atuais (estimados)
  const currentFiles = 280; // Estimativa baseada na estrutura vista
  const currentLOC = 12500; // Estimativa

  // Detectar mudanças comparando com snapshot anterior
  const changes: UpdateResult['changes'] = [];
  
  if (previous) {
    if (currentFiles > previous.totalFiles) {
      changes.push({
        type: 'new',
        description: `${currentFiles - previous.totalFiles} novos arquivos criados`,
        impact: 'Expansão da base de código'
      });
    }
    
    if (currentLOC > previous.totalLOC) {
      changes.push({
        type: 'modified',
        description: `${currentLOC - previous.totalLOC} linhas de código adicionadas`,
        impact: 'Incremento de funcionalidades'
      });
    }
  } else {
    changes.push({
      type: 'new',
      description: 'Primeira análise do projeto',
      impact: 'Snapshot inicial criado'
    });
  }

  // Verificar status das fases baseado nos dados do construction-log
  const phaseStatus = constructionLog.map(phase => ({
    name: phase.phase,
    status: phase.status as 'completed' | 'in-progress' | 'planned'
  }));

  return {
    totalFiles: currentFiles,
    totalLOC: currentLOC,
    changes,
    phaseStatus,
    timestamp: new Date().toISOString()
  };
}

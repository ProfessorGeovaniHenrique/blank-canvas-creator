import jsPDF from 'jspdf';
import { constructionLog, projectStats } from '@/data/developer-logs/construction-log';
import { scientificChangelog } from '@/data/developer-logs/changelog-scientific';

export async function exportDeveloperLogsToPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Função auxiliar para adicionar nova página se necessário
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Função auxiliar para adicionar texto com quebra de linha
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight + 5);
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += 5; // Espaço extra após texto
  };

  // Função para adicionar linha horizontal
  const addHorizontalLine = () => {
    checkPageBreak(5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  // ========== CAPA ==========
  pdf.setFillColor(41, 98, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Developer Logs', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Plataforma de Análise Cultural', pageWidth / 2, pageHeight / 2, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  // ========== SUMÁRIO EXECUTIVO ==========
  pdf.addPage();
  yPosition = margin;
  
  addText('Sumário Executivo', 22, true, [41, 98, 255]);
  addHorizontalLine();
  
  addText(`Total de Fases: ${projectStats.totalPhases}`, 12);
  addText(`Fases Concluídas: ${projectStats.completedPhases}`, 12);
  addText(`Linhas de Código: ${projectStats.totalLinesOfCode.toLocaleString()}`, 12);
  addText(`Decisões Técnicas: ${projectStats.totalDecisions}`, 12);
  addText(`Artefatos Criados: ${projectStats.totalArtifacts}`, 12);
  addText(`Referências Científicas: ${projectStats.totalScientificReferences}`, 12);
  
  yPosition += 10;
  
  // ========== TIMELINE DE FASES ==========
  addText('Timeline de Desenvolvimento', 22, true, [41, 98, 255]);
  addHorizontalLine();
  
  constructionLog.forEach((phase, index) => {
    checkPageBreak(80); // Verificar espaço para fase
    
    // Título da fase
    addText(`${index + 1}. ${phase.phase}`, 14, true);
    
    // Status
    const statusColor: [number, number, number] = phase.status === 'completed' ? [0, 128, 0] : phase.status === 'in-progress' ? [0, 0, 255] : [128, 128, 128];
    const statusText = phase.status === 'completed' ? 'CONCLUÍDA' : phase.status === 'in-progress' ? 'EM PROGRESSO' : 'PLANEJADA';
    addText(`Status: ${statusText}`, 10, false, statusColor);
    
    // Datas
    addText(`Período: ${phase.dateStart}${phase.dateEnd ? ` - ${phase.dateEnd}` : ''}`, 10);
    
    // Objetivo
    addText('Objetivo:', 11, true);
    addText(phase.objective, 10);
    
    // Métricas (se houver)
    if (Object.keys(phase.metrics).length > 0) {
      addText('Métricas:', 11, true);
      Object.entries(phase.metrics).forEach(([key, value]) => {
        if (value) {
          const improvement = ((value.after - value.before) / value.before * 100).toFixed(0);
          addText(`  • ${key}: ${(value.before * 100).toFixed(0)}% → ${(value.after * 100).toFixed(0)}% (+${improvement}%)`, 9);
        }
      });
    }
    
    yPosition += 5;
  });
  
  // ========== DECISÕES TÉCNICAS ==========
  pdf.addPage();
  yPosition = margin;
  
  addText('Decisões Técnicas Principais', 22, true, [41, 98, 255]);
  addHorizontalLine();
  
  let decisionCount = 0;
  constructionLog.forEach((phase) => {
    phase.decisions.slice(0, 2).forEach((decision) => { // Top 2 por fase
      decisionCount++;
      checkPageBreak(60);
      
      addText(`${decisionCount}. ${decision.decision}`, 11, true);
      addText('Justificativa:', 10, true);
      addText(decision.rationale, 9);
      addText('Por que foi escolhida:', 10, true);
      addText(decision.chosenBecause, 9);
      
      if (decision.impact) {
        addText('Impacto:', 10, true, [0, 128, 0]);
        addText(decision.impact, 9);
      }
      
      yPosition += 5;
    });
  });
  
  // ========== CHANGELOG CIENTÍFICO ==========
  pdf.addPage();
  yPosition = margin;
  
  addText('Changelog Científico', 22, true, [41, 98, 255]);
  addHorizontalLine();
  
  scientificChangelog.forEach((version) => {
    checkPageBreak(70);
    
    addText(`Versão ${version.version} - ${version.date}`, 14, true);
    addText(`Metodologia: ${version.methodology}`, 10);
    
    version.scientificAdvances.forEach((advance) => {
      checkPageBreak(40);
      addText(`• ${advance.feature}`, 11, true);
      addText(`  ${advance.linguisticBasis}`, 9);
      
      if (advance.accuracy) {
        addText(`  Precisão: ${(advance.accuracy * 100).toFixed(0)}%`, 9, false, [0, 128, 0]);
      }
      
      if (advance.improvement) {
        addText(`  ${advance.improvement}`, 9, false, [0, 128, 0]);
      }
    });
    
    yPosition += 10;
  });
  
  // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Developer Logs - Plataforma de Análise Cultural | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Salvar PDF
  pdf.save(`developer-logs-${new Date().toISOString().split('T')[0]}.pdf`);
}

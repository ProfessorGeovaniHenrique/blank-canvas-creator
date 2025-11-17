import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalyticsData {
  totalUsers: number;
  usersByRole: Array<{ name: string; value: number }>;
  bannerConversion: { login: number; invite: number };
  onboardingCompletion: number;
  topFeatures: Array<{ name: string; usage: number }>;
  dateRange: { start: string; end: string };
}

export async function exportAnalyticsToPDF(data: AnalyticsData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(102, 126, 234);
  pdf.text('Relatório de Analytics', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Período: ${data.dateRange.start} a ${data.dateRange.end}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;

  // Summary Cards
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Resumo Executivo', 15, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  const summaryData = [
    { label: 'Total de Usuários', value: data.totalUsers.toString() },
    { label: 'Cliques no Banner', value: (data.bannerConversion.login + data.bannerConversion.invite).toString() },
    { label: 'Taxa de Conclusão do Onboarding', value: `${data.onboardingCompletion}%` },
    { label: 'Features Ativas', value: data.topFeatures.length.toString() },
  ];

  summaryData.forEach((item) => {
    pdf.setTextColor(100, 100, 100);
    pdf.text(item.label, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'bold');
    pdf.text(item.value, 120, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += 7;
  });

  yPosition += 10;

  // Users by Role Section
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Distribuição de Usuários por Role', 15, yPosition);
  pdf.setFont(undefined, 'normal');
  yPosition += 8;

  data.usersByRole.forEach((role) => {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${role.name}:`, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(role.value.toString(), 120, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Banner Conversion Section
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Conversão do Banner Promocional', 15, yPosition);
  pdf.setFont(undefined, 'normal');
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Cliques em "Login":', 20, yPosition);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.bannerConversion.login.toString(), 120, yPosition);
  yPosition += 7;

  pdf.setTextColor(100, 100, 100);
  pdf.text('Cliques em "Tenho um Convite":', 20, yPosition);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.bannerConversion.invite.toString(), 120, yPosition);
  yPosition += 10;

  // Top Features Section
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Features Mais Utilizadas', 15, yPosition);
  pdf.setFont(undefined, 'normal');
  yPosition += 8;

  data.topFeatures.slice(0, 5).forEach((feature, index) => {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${index + 1}. ${feature.name}:`, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${feature.usage} usos`, 120, yPosition);
    yPosition += 7;
  });

  // Add charts as images
  yPosition += 10;
  
  // Try to capture chart elements
  const chartElements = document.querySelectorAll('[data-chart-export]');
  
  if (chartElements.length > 0 && yPosition < pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Gráficos e Visualizações', 15, yPosition);
    yPosition += 10;

    for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
      const element = chartElements[i] as HTMLElement;
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }

  // Footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${totalPages} | VersoAustral - ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  pdf.save(`analytics-versoaustral-${new Date().toISOString().split('T')[0]}.pdf`);
}

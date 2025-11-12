import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  FileText, 
  Network, 
  BarChart3, 
  FileBarChart, 
  Cloud, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Maximize,
  TrendingUp,
  TrendingDown,
  HelpCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

// ==================== MOCK DATA ====================

const kwicDataMap: Record<string, Array<{
  leftContext: string;
  keyword: string;
  rightContext: string;
  source: string;
}>> = {
  "verso": [
    { leftContext: "Daí um", keyword: "verso", rightContext: "de campo se chegou da campereada", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "Prá querência galponeira, onde o", keyword: "verso", rightContext: "é mais caseiro", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E o", keyword: "verso", rightContext: "que tinha sonhos prá rondar na madrugada", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E o", keyword: "verso", rightContext: "sonhou ser várzea com sombra de tarumã", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
  "tarumã": [
    { leftContext: "A calma do", keyword: "tarumã", rightContext: ", ganhou sombra mais copada", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E o verso sonhou ser várzea com sombra de", keyword: "tarumã", rightContext: "", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
  "saudade": [
    { leftContext: "A mansidão da campanha traz", keyword: "saudade", rightContext: "feito açoite", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E uma", keyword: "saudade", rightContext: "redomona pelos cantos do galpão", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
  "várzea": [
    { leftContext: "Pela", keyword: "várzea", rightContext: "espichada com o sol da tarde caindo", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E o verso sonhou ser", keyword: "várzea", rightContext: "com sombra de tarumã", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
  "coxilha": [
    { leftContext: "E um ventito da", keyword: "coxilha", rightContext: "trouxe coplas entre as asas", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "Adormecidos na espera do sol pontear na", keyword: "coxilha", rightContext: "", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
  "galpão": [{ leftContext: "E uma saudade redomona pelos cantos do", keyword: "galpão", rightContext: "", source: "Luiz Marenco - Quando o verso vem pras casa" }],
  "sonhos": [{ leftContext: "E o verso que tinha", keyword: "sonhos", rightContext: "prá rondar na madrugada", source: "Luiz Marenco - Quando o verso vem pras casa" }],
  "gateada": [{ leftContext: "No lombo de uma", keyword: "gateada", rightContext: "frente aberta de respeito", source: "Luiz Marenco - Quando o verso vem pras casa" }],
  "mate": [{ leftContext: "Cevou um", keyword: "mate", rightContext: "pura-folha, jujado de maçanilha", source: "Luiz Marenco - Quando o verso vem pras casa" }],
  "sombra": [
    { leftContext: "A calma do tarumã, ganhou", keyword: "sombra", rightContext: "mais copada", source: "Luiz Marenco - Quando o verso vem pras casa" },
    { leftContext: "E o verso sonhou ser várzea com", keyword: "sombra", rightContext: "de tarumã", source: "Luiz Marenco - Quando o verso vem pras casa" }
  ],
};

const dominiosData = [
  {
    dominio: "Natureza e Paisagem Campeira",
    ocorrencias: 48,
    percentual: 28.2,
    palavras: ["tarumã", "várzea", "coxilha", "campo", "campanha", "horizonte", "sombra", "sol"],
    nomeCompleto: "Natureza e Paisagem Campeira",
    representatividade: "Domínio mais presente na música, evidenciando forte conexão com o ambiente rural",
    densidadeLexical: "Alta",
    descricaoContextual: "Reflete a relação íntima do poeta com a paisagem gaúcha, destacando elementos naturais característicos do pampa.",
    fragmentoExemplo: "\"A calma do tarumã, ganhou sombra mais copada / Pela várzea espichada com o sol da tarde caindo\"",
    cor: "hsl(142, 35%, 25%)",
    corTexto: "hsl(142, 80%, 75%)"
  },
  {
    dominio: "Cavalo e Aperos",
    ocorrencias: 38,
    percentual: 22.4,
    palavras: ["gateada", "encilha", "arreios", "esporas", "tropa", "lombo", "ramada", "cambona"],
    nomeCompleto: "Cavalo e Aperos",
    representatividade: "Segundo domínio mais relevante, simbolizando o trabalho campeiro e a tradição equestre",
    densidadeLexical: "Alta",
    descricaoContextual: "Representa a cultura do trabalho com o cavalo, elemento central na vida do gaúcho.",
    fragmentoExemplo: "\"No lombo de uma gateada frente aberta de respeito / Desencilhou na ramada\"",
    cor: "hsl(221, 40%, 25%)",
    corTexto: "hsl(221, 85%, 75%)"
  },
  {
    dominio: "Vida no Galpão",
    ocorrencias: 32,
    percentual: 18.8,
    palavras: ["galpão", "ramada", "candeeiro", "mate", "querência", "fogo", "chão", "cuia", "bomba"],
    nomeCompleto: "Vida no Galpão",
    representatividade: "Espaço de convívio social e descanso do trabalhador campeiro",
    densidadeLexical: "Média-Alta",
    descricaoContextual: "O galpão como centro da vida social campeira, local de chimarrão, descanso e confraternização.",
    fragmentoExemplo: "\"Prá querência galponeira, onde o verso é mais caseiro / Templado a luz de candeeiro\"",
    cor: "hsl(45, 40%, 25%)",
    corTexto: "hsl(45, 95%, 75%)"
  },
  {
    dominio: "Sentimentos e Poesia",
    ocorrencias: 28,
    percentual: 16.5,
    palavras: ["verso", "saudade", "sonhos", "coplas", "mansidão", "calma", "silêncio"],
    nomeCompleto: "Sentimentos e Poesia",
    representatividade: "Dimensão lírica e emocional da composição, explorando a subjetividade do poeta",
    densidadeLexical: "Alta",
    descricaoContextual: "A introspecção poética e o sentimento de saudade, elementos fundamentais da lírica gauchesca.",
    fragmentoExemplo: "\"E o verso que tinha sonhos prá rondar na madrugada / A mansidão da campanha traz saudades feito açoite\"",
    cor: "hsl(291, 35%, 25%)",
    corTexto: "hsl(291, 75%, 75%)"
  },
  {
    dominio: "Tradição Gaúcha",
    ocorrencias: 24,
    percentual: 14.1,
    palavras: ["maragato", "pañuelo", "mate", "maçanilha", "prenda", "campereada"],
    nomeCompleto: "Tradição Gaúcha",
    representatividade: "Elementos culturais específicos da tradição regional sul-rio-grandense",
    densidadeLexical: "Média",
    descricaoContextual: "Vocabulário específico da cultura gaúcha, marcando a identidade regional da composição.",
    fragmentoExemplo: "\"Um pañuelo maragato se abriu no horizonte / Cevou um mate pura-folha, jujado de maçanilha\"",
    cor: "hsl(0, 35%, 25%)",
    corTexto: "hsl(0, 80%, 75%)"
  }
];

const palavrasChaveData = [
  { palavra: "verso", ll: 52.8, mi: 9.2, frequenciaBruta: 4, frequenciaNormalizada: 23.5, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "tarumã", ll: 48.3, mi: 8.8, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "saudade", ll: 38.7, mi: 8.5, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "galpão", ll: 45.2, mi: 7.9, frequenciaBruta: 1, frequenciaNormalizada: 5.9, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "várzea", ll: 32.4, mi: 7.2, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "coxilha", ll: 28.9, mi: 5.8, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Média", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "sombra", ll: 22.3, mi: 4.2, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Média", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "sol", ll: 21.7, mi: 4.0, frequenciaBruta: 2, frequenciaNormalizada: 11.8, significancia: "Média", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
];

const prosodiaData = [
  { palavra: "verso", prosodia: "positiva", contexto: "Elemento lírico central, portador de sonhos e identidade", intensidade: "alta" },
  { palavra: "tarumã", prosodia: "positiva", contexto: "Símbolo de abrigo e tranquilidade campeira", intensidade: "média" },
  { palavra: "saudade", prosodia: "negativa", contexto: "Sentimento melancólico de ausência e distância", intensidade: "alta" },
  { palavra: "sonhos", prosodia: "positiva", contexto: "Aspirações e desejos do eu-lírico", intensidade: "média" },
  { palavra: "silêncio", prosodia: "negativa", contexto: "Ausência que marca a solidão", intensidade: "baixa" },
  { palavra: "calma", prosodia: "positiva", contexto: "Serenidade da paisagem campeira", intensidade: "média" },
];

const networkData = {
  nodes: [
    { id: "verso", label: "verso", size: 40, color: "hsl(291, 75%, 75%)", category: "Sentimentos e Poesia" },
    { id: "tarumã", label: "tarumã", size: 32, color: "hsl(142, 80%, 75%)", category: "Natureza e Paisagem" },
    { id: "saudade", label: "saudade", size: 32, color: "hsl(291, 75%, 75%)", category: "Sentimentos e Poesia" },
    { id: "várzea", label: "várzea", size: 28, color: "hsl(142, 80%, 75%)", category: "Natureza e Paisagem" },
    { id: "galpão", label: "galpão", size: 26, color: "hsl(45, 95%, 75%)", category: "Vida no Galpão" },
    { id: "coxilha", label: "coxilha", size: 28, color: "hsl(142, 80%, 75%)", category: "Natureza e Paisagem" },
    { id: "sonhos", label: "sonhos", size: 24, color: "hsl(291, 75%, 75%)", category: "Sentimentos e Poesia" },
    { id: "mate", label: "mate", size: 20, color: "hsl(45, 95%, 75%)", category: "Vida no Galpão" },
  ],
  links: [
    { source: "verso", target: "saudade", strength: 0.9 },
    { source: "verso", target: "tarumã", strength: 0.8 },
    { source: "verso", target: "sonhos", strength: 0.85 },
    { source: "tarumã", target: "várzea", strength: 0.7 },
    { source: "várzea", target: "coxilha", strength: 0.6 },
    { source: "galpão", target: "mate", strength: 0.75 },
    { source: "saudade", target: "galpão", strength: 0.65 },
  ]
};

// ==================== COMPONENT ====================

export default function Dashboard2() {
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMouseOverChart, setIsMouseOverChart] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<SVGSVGElement>(null);

  // ==================== ZOOM & PAN HANDLERS ====================

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleFitToView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Wheel handler para zoom isolado
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isMouseOverChart) {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY * -0.001;
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }, [isMouseOverChart]);

  useEffect(() => {
    const currentRef = chartRef.current;
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false });
      return () => currentRef.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ==================== WORD CLICK HANDLER ====================

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setModalOpen(true);
  };

  // ==================== RENDER HELPERS ====================

  const renderFloatingToolbar = () => (
    <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 flex items-center gap-1 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-9 w-9">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Aumentar Zoom</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-9 w-9">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diminuir Zoom</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-px h-6 bg-border mx-1" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleFitToView} className="h-9 w-9">
              <Minimize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ajustar à Tela</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-9 w-9">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Resetar Visualização</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-px h-6 bg-border mx-1" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleToggleFullscreen} className="h-9 w-9">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="pt-[120px] px-8 pb-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-3 text-foreground">Dashboard 2.0</h1>
          <p className="text-lg text-muted-foreground/90 max-w-3xl">
            Análise estilística otimizada de <span className="text-primary font-semibold">"Quando o verso vem pras casa"</span> — Luiz Marenco
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <Tabs defaultValue="corpus" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-muted/30">
            <TabsTrigger value="corpus" className="gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Corpus</span>
            </TabsTrigger>
            <TabsTrigger value="dominios" className="gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Domínios</span>
            </TabsTrigger>
            <TabsTrigger value="rede" className="gap-2 py-3">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Rede</span>
            </TabsTrigger>
            <TabsTrigger value="frequencia" className="gap-2 py-3">
              <FileBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Frequência</span>
            </TabsTrigger>
            <TabsTrigger value="estatistica" className="gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estatística</span>
            </TabsTrigger>
            <TabsTrigger value="nuvem" className="gap-2 py-3">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Nuvem</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== CORPUS TAB ==================== */}
          <TabsContent value="corpus" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Informações do Corpus</CardTitle>
                <CardDescription className="text-base">
                  Detalhes estatísticos e metadados do texto analisado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-muted/20 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2">Total de Palavras</div>
                    <div className="text-3xl font-bold text-foreground">170</div>
                  </div>
                  <div className="p-5 bg-muted/20 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2">Palavras Únicas</div>
                    <div className="text-3xl font-bold text-foreground">127</div>
                  </div>
                  <div className="p-5 bg-muted/20 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2">Densidade Lexical</div>
                    <div className="text-3xl font-bold text-foreground">74.7%</div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Metadados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">Título</span>
                      <span className="text-base font-medium text-foreground">Quando o verso vem pras casa</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">Artista</span>
                      <span className="text-base font-medium text-foreground">Luiz Marenco</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">Gênero</span>
                      <span className="text-base font-medium text-foreground">Música Gaúcha / Regional</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">Estilo</span>
                      <span className="text-base font-medium text-foreground">Lírica Campeira</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DOMÍNIOS TAB ==================== */}
          <TabsContent value="dominios" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Domínios Semânticos</CardTitle>
                <CardDescription className="text-base">
                  Agrupamentos temáticos das palavras-chave identificadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Bar Chart */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dominiosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="dominio" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => value.split(' ')[0]}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: any) => [`${value} ocorrências`, 'Total']}
                      />
                      <Bar dataKey="ocorrencias" radius={[6, 6, 0, 0]}>
                        {dominiosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.corTexto} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Domain Cards */}
                <div className="space-y-6">
                  {dominiosData.map((dominio) => (
                    <Card key={dominio.dominio} className="border-border/50 hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">{dominio.nomeCompleto}</CardTitle>
                            <CardDescription className="text-sm">{dominio.descricaoContextual}</CardDescription>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="ml-4 text-base px-3 py-1"
                                  style={{ 
                                    backgroundColor: dominio.cor,
                                    color: dominio.corTexto,
                                    borderColor: dominio.corTexto
                                  }}
                                >
                                  {dominio.percentual}%
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">Representatividade: {dominio.percentual}%</p>
                                  <p className="text-xs">{dominio.representatividade}</p>
                                  <p className="text-xs mt-2"><strong>Densidade:</strong> {dominio.densidadeLexical}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {dominio.palavras.map((palavra) => {
                            const stats = palavrasChaveData.find(p => p.palavra === palavra);
                            return (
                              <TooltipProvider key={palavra}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="secondary"
                                      className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1 text-sm"
                                      onClick={() => handleWordClick(palavra)}
                                    >
                                      {palavra}
                                    </Badge>
                                  </TooltipTrigger>
                                  {stats && (
                                    <TooltipContent side="top" className="max-w-xs z-50">
                                      <div className="space-y-2">
                                        <p className="font-bold text-sm">{palavra}</p>
                                        <div className="space-y-1 text-xs">
                                          <p><strong>Frequência no Corpus:</strong> {stats.frequenciaBruta} ({stats.frequenciaNormalizada}/10k palavras)</p>
                                          <p><strong>Significância:</strong> {stats.significancia}</p>
                                          <p><strong>Log-Likelihood:</strong> {stats.ll.toFixed(1)}</p>
                                          <p className="flex items-center gap-1">
                                            <strong>Efeito:</strong> 
                                            <span className={stats.efeito === "Sobre-uso" ? "text-success" : "text-muted-foreground"}>
                                              {stats.efeito}
                                            </span>
                                            {stats.efeito === "Sobre-uso" && <TrendingUp className="h-3 w-3 text-success" />}
                                          </p>
                                        </div>
                                        <p className="text-xs italic pt-1 border-t border-border">Clique para ver contexto (KWIC)</p>
                                      </div>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                        
                        {dominio.fragmentoExemplo && (
                          <div className="pt-3 mt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-1">Exemplo na música:</p>
                            <p className="text-sm italic text-foreground/80">{dominio.fragmentoExemplo}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== REDE TAB ==================== */}
          <TabsContent value="rede" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Rede Semântica</CardTitle>
                <CardDescription className="text-base">
                  Visualização das conexões entre palavras-chave por coocorrência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={chartRef}
                  className={`relative bg-muted/10 rounded-lg border border-border/50 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}
                  onMouseEnter={() => setIsMouseOverChart(true)}
                  onMouseLeave={() => {
                    setIsMouseOverChart(false);
                    handleMouseUp();
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <svg
                    ref={networkRef}
                    width="100%"
                    height="100%"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                      transformOrigin: 'center',
                      transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}
                  >
                    {/* Links */}
                    <g>
                      {networkData.links.map((link, i) => {
                        const sourceNode = networkData.nodes.find(n => n.id === link.source);
                        const targetNode = networkData.nodes.find(n => n.id === link.target);
                        if (!sourceNode || !targetNode) return null;
                        
                        const x1 = 100 + (i % 3) * 250;
                        const y1 = 100 + Math.floor(i / 3) * 150;
                        const x2 = x1 + 200;
                        const y2 = y1 + 100;

                        return (
                          <line
                            key={`link-${i}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="hsl(var(--border))"
                            strokeWidth={link.strength * 3}
                            opacity={0.3}
                          />
                        );
                      })}
                    </g>

                    {/* Nodes */}
                    <g>
                      {networkData.nodes.map((node, i) => {
                        const x = 100 + (i % 3) * 250;
                        const y = 100 + Math.floor(i / 3) * 150;

                        return (
                          <g key={node.id}>
                            <circle
                              cx={x}
                              cy={y}
                              r={node.size}
                              fill={node.color}
                              stroke="hsl(var(--border))"
                              strokeWidth="2"
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleWordClick(node.label)}
                            />
                            <text
                              x={x}
                              y={y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="hsl(var(--background))"
                              fontSize="12"
                              fontWeight="600"
                              className="pointer-events-none"
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                  {renderFloatingToolbar()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== FREQUÊNCIA TAB ==================== */}
          <TabsContent value="frequencia" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Análise de Frequência</CardTitle>
                <CardDescription className="text-base">
                  Ranking de palavras por frequência absoluta e normalizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-foreground font-semibold">Palavra</TableHead>
                        <TableHead className="text-foreground font-semibold">Freq. Bruta</TableHead>
                        <TableHead className="text-foreground font-semibold">Freq. Normalizada</TableHead>
                        <TableHead className="text-foreground font-semibold">Significância</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {palavrasChaveData.map((item) => (
                        <TableRow 
                          key={item.palavra} 
                          className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => handleWordClick(item.palavra)}
                        >
                          <TableCell className="font-medium text-foreground">{item.palavra}</TableCell>
                          <TableCell className="text-muted-foreground">{item.frequenciaBruta}</TableCell>
                          <TableCell className="text-muted-foreground">{item.frequenciaNormalizada}</TableCell>
                          <TableCell>
                            <Badge variant={item.significancia === "Alta" ? "default" : "secondary"}>
                              {item.significancia}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ESTATÍSTICA TAB ==================== */}
          <TabsContent value="estatistica" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Estatísticas de Significância</CardTitle>
                <CardDescription className="text-base">
                  Medidas estatísticas de relevância: Log-Likelihood e Mutual Information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Log-Likelihood Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Log-Likelihood</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={palavrasChaveData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis 
                          dataKey="palavra" 
                          type="category" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="ll" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* MI Score Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Mutual Information (MI Score)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={palavrasChaveData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis 
                          dataKey="palavra" 
                          type="category" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="mi" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Prosódia Semântica */}
                <div className="pt-6 border-t border-border/30">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Prosódia Semântica</h3>
                  <div className="rounded-lg border border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-foreground font-semibold">Palavra</TableHead>
                          <TableHead className="text-foreground font-semibold">Prosódia</TableHead>
                          <TableHead className="text-foreground font-semibold">Contexto</TableHead>
                          <TableHead className="text-foreground font-semibold">Intensidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prosodiaData.map((item) => (
                          <TableRow key={item.palavra} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium text-foreground">{item.palavra}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.prosodia === "positiva" ? "default" : item.prosodia === "negativa" ? "destructive" : "secondary"}
                              >
                                {item.prosodia}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-md">{item.contexto}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.intensidade}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== NUVEM TAB ==================== */}
          <TabsContent value="nuvem" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Nuvem de Palavras</CardTitle>
                <CardDescription className="text-base">
                  Representação visual da frequência das palavras-chave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] flex items-center justify-center bg-muted/10 rounded-lg border border-border/50 p-8">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {palavrasChaveData.map((item, index) => {
                      const fontSize = 16 + (item.frequenciaBruta * 8);
                      return (
                        <TooltipProvider key={item.palavra}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="cursor-pointer hover:opacity-70 transition-opacity font-semibold"
                                style={{ 
                                  fontSize: `${fontSize}px`,
                                  color: `hsl(${(index * 40) % 360}, 70%, 60%)`
                                }}
                                onClick={() => handleWordClick(item.palavra)}
                              >
                                {item.palavra}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{item.palavra}</p>
                              <p className="text-xs">Frequência: {item.frequenciaBruta}</p>
                              <p className="text-xs">Clique para ver contexto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== KWIC MODAL ==================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Concordância: <span className="text-primary">{selectedWord}</span></DialogTitle>
            <DialogDescription>
              Todas as ocorrências da palavra no contexto da música (KWIC - Key Word In Context)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {kwicDataMap[selectedWord]?.map((item, idx) => (
              <div key={idx} className="p-4 bg-muted/20 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                </div>
                <p className="text-base leading-relaxed">
                  <span className="text-muted-foreground">{item.leftContext}</span>
                  {" "}
                  <span className="font-bold text-primary bg-primary/10 px-1 rounded">{item.keyword}</span>
                  {" "}
                  <span className="text-muted-foreground">{item.rightContext}</span>
                </p>
              </div>
            )) || (
              <p className="text-center text-muted-foreground py-8">Nenhum contexto disponível para esta palavra.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

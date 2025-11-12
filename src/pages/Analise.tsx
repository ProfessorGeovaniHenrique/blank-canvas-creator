import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KWICModal } from "@/components/KWICModal";
import { Download, FileText, Network, Sparkles, BarChart3, FileBarChart, Cloud, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Mock data para a palavra "verso"
const kwicData = [
  {
    leftContext: "...Daí um",
    keyword: "verso",
    rightContext: "de campo se chegou...",
    source: "'Quando o verso vem pras casa'",
  },
  {
    leftContext: "...galponeira, onde o",
    keyword: "verso",
    rightContext: "é mais caseiro...",
    source: "'Quando o verso vem pras casa'",
  },
  {
    leftContext: "...E o",
    keyword: "verso",
    rightContext: "que tinha sonhos prá rondar...",
    source: "'Quando o verso vem pras casa'",
  },
  {
    leftContext: "...E o",
    keyword: "verso",
    rightContext: "sonhou ser várzea com sombra...",
    source: "'Quando o verso vem pras casa'",
  },
];

const dominiosData = [
  { 
    dominio: "Cultura e Tradição Gaúcha", 
    ocorrencias: 145, 
    percentual: 27.0,
    palavras: ["gaúcho", "tradição", "cultura", "pilcha", "galpão", "raiz"],
    cor: "hsl(var(--primary))"
  },
  { 
    dominio: "Paisagem do Pampa", 
    ocorrencias: 132, 
    percentual: 24.5,
    palavras: ["pampa", "campo", "coxilha", "querência", "horizonte", "verde"],
    cor: "hsl(var(--success))"
  },
  { 
    dominio: "Lida Campeira", 
    ocorrencias: 98, 
    percentual: 18.2,
    palavras: ["cavalo", "laço", "lida", "peão", "rodeio", "domado"],
    cor: "hsl(var(--accent))"
  },
  { 
    dominio: "Música e Dança", 
    ocorrencias: 87, 
    percentual: 16.1,
    palavras: ["vanera", "milonga", "gaita", "viola", "bailanta", "cantoria"],
    cor: "#ef4444"
  },
  { 
    dominio: "Costumes e Alimentação", 
    ocorrencias: 76, 
    percentual: 14.2,
    palavras: ["chimarrão", "churrasco", "mate", "carreteiro", "costela", "cevada"],
    cor: "#06b6d4"
  },
];

const lematizacaoData = [
  { original: "empresas", lema: "empresa", classe: "NOUN" },
  { original: "investem", lema: "investir", classe: "VERB" },
  { original: "desenvolvendo", lema: "desenvolver", classe: "VERB" },
  { original: "digitais", lema: "digital", classe: "ADJ" },
  { original: "rapidamente", lema: "rápido", classe: "ADV" },
];

const logLikelihoodData = [
  { palavra: "tecnologia", valor: 48.50, cor: "#ef4444" },
  { palavra: "digital", valor: 42.30, cor: "#ef4444" },
  { palavra: "inovação", valor: 38.70, cor: "#ef4444" },
  { palavra: "desenvolvimento", valor: 28.40, cor: "#f59e0b" },
  { palavra: "dados", valor: 24.10, cor: "#f59e0b" },
  { palavra: "sistema", valor: 8.30, cor: "#10b981" },
];

const miScoreData = [
  { palavra: "tecnologia", valor: 7.20, cor: "#3b82f6" },
  { palavra: "digital", valor: 6.80, cor: "#3b82f6" },
  { palavra: "inovação", valor: 6.50, cor: "#8b5cf6" },
  { palavra: "desenvolvimento", valor: 5.20, cor: "#8b5cf6" },
  { palavra: "dados", valor: 4.80, cor: "#8b5cf6" },
  { palavra: "sistema", valor: 2.10, cor: "#6b7280" },
];

const palavrasChaveData = [
  { palavra: "tecnologia", ll: 48.50, mi: 7.20, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "digital", ll: 42.30, mi: 6.80, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "inovação", ll: 38.70, mi: 6.50, significancia: "Alta", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "desenvolvimento", ll: 28.40, mi: 5.20, significancia: "Média", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "dados", ll: 24.10, mi: 4.80, significancia: "Média", efeito: "Sobre-uso", efeitoIcon: TrendingUp },
  { palavra: "sistema", ll: 8.30, mi: 2.10, significancia: "Baixa", efeito: "Normal", efeitoIcon: TrendingUp },
  { palavra: "mercado", ll: -8.20, mi: 1.80, significancia: "Baixa", efeito: "Sub-uso", efeitoIcon: TrendingDown },
  { palavra: "empresa", ll: -12.50, mi: 1.50, significancia: "Média", efeito: "Sub-uso", efeitoIcon: TrendingDown },
];

export default function Analise() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Resultados da Análise: 'Quando o verso vem pras casa'
          </h1>
          <p className="text-muted-foreground">
            Análise semântica completa do corpus
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      <Tabs defaultValue="dominios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dominios" className="gap-2">
            <FileText className="h-4 w-4" />
            Domínios
          </TabsTrigger>
          <TabsTrigger value="anotacao" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Anotação
          </TabsTrigger>
          <TabsTrigger value="rede" className="gap-2">
            <Network className="h-4 w-4" />
            Rede
          </TabsTrigger>
          <TabsTrigger value="clustering" className="gap-2" disabled>
            <Sparkles className="h-4 w-4" />
            Clustering
          </TabsTrigger>
          <TabsTrigger value="frequencia" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Frequência
          </TabsTrigger>
          <TabsTrigger value="estatistica" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Estatística
          </TabsTrigger>
          <TabsTrigger value="nuvem" className="gap-2">
            <Cloud className="h-4 w-4" />
            Nuvem
          </TabsTrigger>
        </TabsList>

        {/* Tab: Domínios */}
        <TabsContent value="dominios" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-success/10">
                      <FileText className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <CardTitle>Domínios Semânticos Identificados</CardTitle>
                      <CardDescription>
                        Análise baseada em IA - 5 domínios detectados em 185 palavras
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dominiosData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.cor }}
                          />
                          <h3 className="font-semibold">{item.dominio}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span># {item.ocorrencias} ocorrências</span>
                          <span className="text-foreground font-semibold">{item.percentual}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all" 
                          style={{ width: `${item.percentual}%`, backgroundColor: item.cor }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.palavras.map((palavra, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-success/20"
                            style={{ backgroundColor: `${item.cor}15` }}
                            onClick={() => handleWordClick(palavra)}
                          >
                            {palavra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Frequências</CardTitle>
                  <CardDescription>Visualização comparativa dos domínios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dominiosData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate max-w-[140px]">{item.dominio}</span>
                          <span className="font-semibold">{item.ocorrencias}</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-8">
                          <div 
                            className="h-8 rounded-full transition-all" 
                            style={{ 
                              width: `${(item.ocorrencias / 185) * 100}%`, 
                              backgroundColor: item.cor 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Anotação */}
        <TabsContent value="anotacao" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Anotação Morfossintática e Lematização</CardTitle>
                  <CardDescription>
                    Análise automática de POS tagging e redução de palavras aos seus lemas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="lematizacao" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="texto">Texto Anotado</TabsTrigger>
                  <TabsTrigger value="estatisticas">Estatísticas POS</TabsTrigger>
                  <TabsTrigger value="lematizacao">Lematização</TabsTrigger>
                </TabsList>
                
                <TabsContent value="lematizacao" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Exemplos de Lematização
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Redução de palavras flexionadas aos seus lemas (forma canônica)
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Palavra Original</TableHead>
                          <TableHead>Lema</TableHead>
                          <TableHead>Classe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lematizacaoData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{item.original}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                {item.lema}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  item.classe === "NOUN" ? "bg-primary/10 text-primary" :
                                  item.classe === "VERB" ? "bg-destructive/10 text-destructive" :
                                  "bg-accent/10 text-accent"
                                }
                              >
                                {item.classe}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Sobre Lematização</h4>
                    <p className="text-sm text-muted-foreground">
                      A lematização reduz palavras flexionadas à sua forma base (lema). Por exemplo: "empresas" → "empresa", "investem" → "investir". Isso é essencial para análises linguísticas precisas, pois agrupa diferentes formas da mesma palavra.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Rede */}
        <TabsContent value="rede" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Rede Semântica e Prosódia</CardTitle>
                    <CardDescription>
                      Conexões entre palavras-chave e análise de prosódia semântica
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Network className="h-3 w-3" />
                  6 conexões mapeadas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex items-center justify-center bg-muted/20 rounded-lg p-8 min-h-[400px]">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <button
                      onClick={() => handleWordClick("gaúcho")}
                      className="absolute top-1/4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:scale-110 transition-transform cursor-pointer"
                    >
                      gaúcho
                    </button>
                    <button
                      onClick={() => handleWordClick("pilcha")}
                      className="absolute top-1/2 left-1/4 px-4 py-2 rounded-full border-2 border-primary/60 text-foreground hover:scale-110 transition-transform cursor-pointer"
                    >
                      pilcha
                    </button>
                    <button
                      onClick={() => handleWordClick("tradição")}
                      className="absolute top-1/2 right-1/4 px-4 py-2 rounded-full border-2 border-primary/60 text-foreground hover:scale-110 transition-transform cursor-pointer"
                    >
                      tradição
                    </button>
                    <button
                      onClick={() => handleWordClick("cultura")}
                      className="absolute bottom-1/4 left-1/3 px-4 py-2 rounded-full border-2 border-primary/40 text-muted-foreground hover:scale-110 transition-transform cursor-pointer"
                    >
                      cultura
                    </button>
                    <button
                      onClick={() => handleWordClick("galpão")}
                      className="absolute bottom-1/4 right-1/3 px-4 py-2 rounded-full border-2 border-primary/40 text-muted-foreground hover:scale-110 transition-transform cursor-pointer"
                    >
                      galpão
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Análise de Prosódia Semântica</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-success/10 text-success">Positiva</Badge>
                          <span className="font-semibold">tecnologia</span>
                          <span className="text-sm text-muted-foreground ml-auto">Força: 85%</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-success/5">inovação</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">digital</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">sistema</Badge>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-success/10 text-success">Positiva</Badge>
                          <span className="font-semibold">inovação</span>
                          <span className="text-sm text-muted-foreground ml-auto">Força: 92%</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-success/5">tecnologia</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">desenvolvimento</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">digital</Badge>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-success/10 text-success">Positiva</Badge>
                          <span className="font-semibold">digital</span>
                          <span className="text-sm text-muted-foreground ml-auto">Força: 78%</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-success/5">tecnologia</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">sistema</Badge>
                          <Badge variant="outline" className="text-xs bg-success/5">comunicação</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Frequência */}
        <TabsContent value="frequencia" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <FileBarChart className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Análise Log-Likelihood (LL)</CardTitle>
                    <button className="p-1 hover:bg-muted rounded-full transition-colors group relative">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-xs text-sm">
                          <p className="font-semibold mb-1">O que é Log-Likelihood?</p>
                          <p>É um teste estatístico que mostra se uma palavra aparece muito mais (ou muito menos) no seu corpus de estudo do que esperado.</p>
                          <p className="mt-2 text-xs">Valores altos = a palavra é super característica das músicas gaúchas!</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <CardDescription>
                  Palavras-chave em comparação com o corpus de referência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={logLikelihoodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="palavra" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      label={{ value: 'Log-Likelihood', angle: -90, position: 'insideLeft' }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {logLikelihoodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#ef4444]" />
                    <span>LL {'>'} 15.13 = p {'<'} 0.0001 (extremamente significativo)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#f59e0b]" />
                    <span>LL {'>'} 6.63 = p {'<'} 0.01 (muito significativo)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#10b981]" />
                    <span>LL {'>'} 3.84 = p {'<'} 0.05 (significativo)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Mutual Information Score (MI)</CardTitle>
                    <button className="p-1 hover:bg-muted rounded-full transition-colors group relative">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-xs text-sm">
                          <p className="font-semibold mb-1">O que é MI Score?</p>
                          <p>Mede o quanto uma palavra está "ligada" ao seu corpus. É como medir a força da associação entre a palavra e o tipo de música.</p>
                          <p className="mt-2 text-xs">MI alto = essa palavra é típica das músicas gaúchas!</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <CardDescription>
                  Força da associação entre palavra e corpus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={miScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="palavra" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      label={{ value: 'MI Score', angle: -90, position: 'insideLeft' }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {miScoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#3b82f6]" />
                    <span>MI {'>'} 6 = Associação muito forte</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#8b5cf6]" />
                    <span>MI 4-6 = Associação forte</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-[#6b7280]" />
                    <span>MI {'<'} 4 = Associação moderada/fraca</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Estatística */}
        <TabsContent value="estatistica" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Palavras-Chave Estatísticas</CardTitle>
              <CardDescription>
                Análise combinada de Log-Likelihood e MI Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavra</TableHead>
                    <TableHead className="text-right">Log-Likelihood</TableHead>
                    <TableHead className="text-right">MI Score</TableHead>
                    <TableHead>Significância</TableHead>
                    <TableHead>Efeito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {palavrasChaveData.map((item, index) => {
                    const EfeitoIcon = item.efeitoIcon;
                    return (
                      <TableRow 
                        key={index}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleWordClick(item.palavra)}
                      >
                        <TableCell className="font-mono font-semibold">{item.palavra}</TableCell>
                        <TableCell className={`text-right font-semibold ${item.ll > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {item.ll.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{item.mi.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={
                              item.significancia === "Alta" ? "bg-destructive/10 text-destructive" :
                              item.significancia === "Média" ? "bg-accent/10 text-accent" :
                              "bg-success/10 text-success"
                            }
                          >
                            {item.significancia}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <EfeitoIcon className={`h-4 w-4 ${item.efeito === 'Sobre-uso' ? 'text-destructive' : item.efeito === 'Sub-uso' ? 'text-primary' : 'text-success'}`} />
                            <span className="text-sm">{item.efeito}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Nuvem */}
        <TabsContent value="nuvem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuvem de Domínios</CardTitle>
              <CardDescription>Visualização interativa dos principais termos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-8 py-12 min-h-[300px]">
                <button
                  onClick={() => handleWordClick("verso")}
                  className="text-5xl font-bold text-primary hover:scale-110 transition-transform cursor-pointer"
                >
                  VERSO
                </button>
                <button
                  onClick={() => handleWordClick("campo")}
                  className="text-4xl font-bold text-success hover:scale-110 transition-transform cursor-pointer"
                >
                  CAMPO
                </button>
                <button
                  onClick={() => handleWordClick("saudade")}
                  className="text-3xl font-bold text-accent hover:scale-110 transition-transform cursor-pointer"
                >
                  SAUDADE
                </button>
                <button
                  onClick={() => handleWordClick("galpão")}
                  className="text-4xl font-bold text-success hover:scale-110 transition-transform cursor-pointer"
                >
                  GALPÃO
                </button>
                <button
                  onClick={() => handleWordClick("tarumã")}
                  className="text-3xl font-bold text-primary hover:scale-110 transition-transform cursor-pointer"
                >
                  TARUMÃ
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal KWIC */}
      <KWICModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        word={selectedWord}
        data={selectedWord === "verso" ? kwicData : []}
      />
    </div>
  );
}

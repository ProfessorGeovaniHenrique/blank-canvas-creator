import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KWICModal } from "@/components/KWICModal";
import { InteractiveSemanticNetwork } from "@/components/InteractiveSemanticNetwork";
import { OrbitalConstellationChart } from "@/components/OrbitalConstellationChart";
import { NavigationToolbar } from "@/components/NavigationToolbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Network, Sparkles, BarChart3, FileBarChart, Cloud, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ==================== DADOS MOCKUP ====================
// Todos os dados são baseados na letra da música "Quando o verso vem pras casa" de Luiz Marenco

const kwicDataMap: Record<string, Array<{
  leftContext: string;
  keyword: string;
  rightContext: string;
  source: string;
}>> = {
  "verso": [{
    leftContext: "Daí um",
    keyword: "verso",
    rightContext: "de campo se chegou da campereada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "Prá querência galponeira, onde o",
    keyword: "verso",
    rightContext: "é mais caseiro",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E o",
    keyword: "verso",
    rightContext: "que tinha sonhos prá rondar na madrugada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E o",
    keyword: "verso",
    rightContext: "sonhou ser várzea com sombra de tarumã",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "tarumã": [{
    leftContext: "A calma do",
    keyword: "tarumã",
    rightContext: ", ganhou sombra mais copada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E o verso sonhou ser várzea com sombra de",
    keyword: "tarumã",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "saudade": [{
    leftContext: "A mansidão da campanha traz",
    keyword: "saudade",
    rightContext: "feito açoite",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E uma",
    keyword: "saudade",
    rightContext: "redomona pelos cantos do galpão",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "galpão": [{
    leftContext: "E uma saudade redomona pelos cantos do",
    keyword: "galpão",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "várzea": [{
    leftContext: "Pela",
    keyword: "várzea",
    rightContext: "espichada com o sol da tarde caindo",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E o verso sonhou ser",
    keyword: "várzea",
    rightContext: "com sombra de tarumã",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "sonhos": [{
    leftContext: "E o verso que tinha",
    keyword: "sonhos",
    rightContext: "prá rondar na madrugada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "gateada": [{
    leftContext: "No lombo de uma",
    keyword: "gateada",
    rightContext: "frente aberta de respeito",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "mate": [{
    leftContext: "Cevou um",
    keyword: "mate",
    rightContext: "pura-folha, jujado de maçanilha",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "coxilha": [{
    leftContext: "E um ventito da",
    keyword: "coxilha",
    rightContext: "trouxe coplas entre as asas",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "Adormecidos na espera do sol pontear na",
    keyword: "coxilha",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "sombra": [{
    leftContext: "A calma do tarumã, ganhou",
    keyword: "sombra",
    rightContext: "mais copada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "E o verso sonhou ser várzea com",
    keyword: "sombra",
    rightContext: "de tarumã",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "arreios": [{
    leftContext: "Ficaram",
    keyword: "arreios",
    rightContext: "suados e o silencio de esporas",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "esporas": [{
    leftContext: "Ficaram arreios suados e o silencio de",
    keyword: "esporas",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "prenda": [{
    leftContext: "Sonhou com os olhos da",
    keyword: "prenda",
    rightContext: "vestidos de primavera",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "ramada": [{
    leftContext: "Desencilhou na",
    keyword: "ramada",
    rightContext: ", já cansado das lonjuras",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "candeeiro": [{
    leftContext: "Templado a luz de",
    keyword: "candeeiro",
    rightContext: "e um \"quarto gordo nas brasa\"",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "querência": [{
    leftContext: "Prá",
    keyword: "querência",
    rightContext: "galponeira, onde o verso é mais caseiro",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "cuia": [{
    leftContext: "Uma",
    keyword: "cuia",
    rightContext: "e uma bomba recostada na cambona",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "maragato": [{
    leftContext: "Um pañuelo",
    keyword: "maragato",
    rightContext: "se abriu no horizonte",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "campereada": [{
    leftContext: "Daí um verso de campo se chegou da",
    keyword: "campereada",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "calma": [{
    leftContext: "A",
    keyword: "calma",
    rightContext: "do tarumã, ganhou sombra mais copada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "encilha": [{
    leftContext: "Ser um galo prás manhãs, ou um gateado prá",
    keyword: "encilha",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "campo": [{
    leftContext: "Daí um verso de",
    keyword: "campo",
    rightContext: "se chegou da campereada",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "campanha": [{
    leftContext: "A mansidão da",
    keyword: "campanha",
    rightContext: "traz saudades feito açoite",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "horizonte": [{
    leftContext: "Um pañuelo maragato se abriu no",
    keyword: "horizonte",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "sol": [{
    leftContext: "Pela várzea espichada com o",
    keyword: "sol",
    rightContext: "da tarde caindo",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }, {
    leftContext: "Adormecidos na espera do",
    keyword: "sol",
    rightContext: "pontear na coxilha",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "tropa": [{
    leftContext: "Deixou a cancela encostada e a",
    keyword: "tropa",
    rightContext: "se desgarrou",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "lombo": [{
    leftContext: "No",
    keyword: "lombo",
    rightContext: "de uma gateada frente aberta de respeito",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "cambona": [{
    leftContext: "Uma cuia e uma bomba recostada na",
    keyword: "cambona",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "fogo": [{
    leftContext: "Um cerne com cor de aurora queimando em",
    keyword: "fogo",
    rightContext: "de chão",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "chão": [{
    leftContext: "Um cerne com cor de aurora queimando em fogo de",
    keyword: "chão",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "bomba": [{
    leftContext: "Uma cuia e uma",
    keyword: "bomba",
    rightContext: "recostada na cambona",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "coplas": [{
    leftContext: "E um ventito da coxilha trouxe",
    keyword: "coplas",
    rightContext: "entre as asas",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "mansidão": [{
    leftContext: "A",
    keyword: "mansidão",
    rightContext: "da campanha traz saudades feito açoite",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "silêncio": [{
    leftContext: "Ficaram arreios suados e o",
    keyword: "silêncio",
    rightContext: "de esporas",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "pañuelo": [{
    leftContext: "Um",
    keyword: "pañuelo",
    rightContext: "maragato se abriu no horizonte",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }],
  "maçanilha": [{
    leftContext: "Cevou um mate pura-folha, jujado de",
    keyword: "maçanilha",
    rightContext: "",
    source: "Luiz Marenco - Quando o verso vem pras casa"
  }]
};

const dominiosData = [{
  dominio: "Natureza e Paisagem Campeira",
  nomeCompleto: "Natureza e Paisagem Campeira",
  ocorrencias: 48,
  percentual: 28.2,
  palavras: ["tarumã", "várzea", "coxilha", "campo", "campanha", "horizonte", "sombra", "sol"],
  cor: "hsl(142, 35%, 35%)",
  corTexto: "hsl(142, 80%, 85%)",
  descricao: "Vocabulário que evoca o ambiente natural do pampa gaúcho",
  fragmento: '"Pela várzea espichada... A calma do tarumã, ganhou sombra mais copada"'
}, {
  dominio: "Cavalo e Aperos",
  nomeCompleto: "Cavalo e Aperos",
  ocorrencias: 38,
  percentual: 22.4,
  palavras: ["gateada", "encilha", "arreios", "esporas", "tropa", "lombo", "ramada", "cambona"],
  cor: "hsl(221, 40%, 35%)",
  corTexto: "hsl(221, 85%, 85%)",
  descricao: "Elementos do universo equestre e dos apetrechos campeiros",
  fragmento: '"No lombo de uma gateada... Ficaram arreios suados e o silêncio de esporas"'
}, {
  dominio: "Vida no Galpão",
  nomeCompleto: "Vida no Galpão",
  ocorrencias: 32,
  percentual: 18.8,
  palavras: ["galpão", "ramada", "candeeiro", "mate", "querência", "fogo", "chão", "cuia", "bomba"],
  cor: "hsl(45, 40%, 35%)",
  corTexto: "hsl(45, 95%, 85%)",
  descricao: "Cotidiano e sociabilidade no espaço do galpão campeiro",
  fragmento: '"Cevou um mate pura-folha... Templado a luz de candeeiro"'
}, {
  dominio: "Sentimentos e Poesia",
  nomeCompleto: "Sentimentos e Poesia",
  ocorrencias: 28,
  percentual: 16.5,
  palavras: ["verso", "saudade", "sonhos", "coplas", "mansidão", "calma", "silêncio"],
  cor: "hsl(291, 35%, 35%)",
  corTexto: "hsl(291, 75%, 85%)",
  descricao: "Dimensão afetiva e lírica da narrativa",
  fragmento: '"E o verso que tinha sonhos... E uma saudade redomona pelos cantos do galpão"'
}, {
  dominio: "Tradição Gaúcha",
  nomeCompleto: "Tradição Gaúcha",
  ocorrencias: 24,
  percentual: 14.1,
  palavras: ["maragato", "pañuelo", "mate", "maçanilha", "prenda", "campereada"],
  cor: "hsl(0, 35%, 35%)",
  corTexto: "hsl(0, 80%, 85%)",
  descricao: "Símbolos e práticas da cultura gauchesca",
  fragmento: '"Um pañuelo maragato se abriu no horizonte"'
}];

const palavrasChaveData = [{
  palavra: "verso",
  ll: 52.8,
  mi: 9.2,
  frequenciaBruta: 4,
  frequenciaNormalizada: 23.5,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "tarumã",
  ll: 48.3,
  mi: 8.8,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "saudade",
  ll: 38.7,
  mi: 8.5,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "galpão",
  ll: 45.2,
  mi: 7.9,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "várzea",
  ll: 32.4,
  mi: 7.2,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "coxilha",
  ll: 28.9,
  mi: 5.8,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "gateada",
  ll: 24.1,
  mi: 4.9,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "sonhos",
  ll: 18.5,
  mi: 3.8,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "sombra",
  ll: 22.3,
  mi: 4.2,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "sol",
  ll: 21.7,
  mi: 4.0,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "encilha",
  ll: 19.2,
  mi: 3.6,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "arreios",
  ll: 17.8,
  mi: 3.4,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "esporas",
  ll: 16.9,
  mi: 3.3,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "mate",
  ll: 20.5,
  mi: 3.9,
  frequenciaBruta: 2,
  frequenciaNormalizada: 11.8,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "candeeiro",
  ll: 19.8,
  mi: 3.7,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "querência",
  ll: 18.6,
  mi: 3.5,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "cuia",
  ll: 21.4,
  mi: 4.1,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "bomba",
  ll: 20.1,
  mi: 3.8,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "coplas",
  ll: 19.5,
  mi: 3.7,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "mansidão",
  ll: 18.9,
  mi: 3.6,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "silêncio",
  ll: 17.6,
  mi: 3.4,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "maragato",
  ll: 22.7,
  mi: 4.3,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Alta",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "pañuelo",
  ll: 21.9,
  mi: 4.2,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "maçanilha",
  ll: 20.8,
  mi: 4.0,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "prenda",
  ll: 19.1,
  mi: 3.7,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "campereada",
  ll: 18.3,
  mi: 3.5,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "campanha",
  ll: 15.2,
  mi: 3.2,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "campo",
  ll: 14.8,
  mi: 3.1,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "horizonte",
  ll: 13.5,
  mi: 2.9,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "fogo",
  ll: 17.3,
  mi: 3.3,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "chão",
  ll: 16.8,
  mi: 3.2,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "tropa",
  ll: 16.2,
  mi: 3.2,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "lombo",
  ll: 15.8,
  mi: 3.1,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}, {
  palavra: "ramada",
  ll: 18.4,
  mi: 3.5,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "cambona",
  ll: 17.1,
  mi: 3.3,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Média",
  efeito: "Sobre-uso",
  efeitoIcon: TrendingUp
}, {
  palavra: "calma",
  ll: 14.2,
  mi: 2.8,
  frequenciaBruta: 1,
  frequenciaNormalizada: 5.9,
  significancia: "Baixa",
  efeito: "Normal",
  efeitoIcon: TrendingUp
}];

const logLikelihoodData = [
  { palavra: "verso", valor: 52.8, cor: "hsl(142, 71%, 45%)" },
  { palavra: "tarumã", valor: 48.3, cor: "hsl(142, 71%, 45%)" },
  { palavra: "galpão", valor: 45.2, cor: "hsl(142, 71%, 45%)" },
  { palavra: "saudade", valor: 38.7, cor: "hsl(142, 71%, 45%)" },
  { palavra: "várzea", valor: 32.4, cor: "hsl(142, 71%, 45%)" },
  { palavra: "coxilha", valor: 28.9, cor: "hsl(0, 72%, 51%)" },
  { palavra: "gateada", valor: 24.1, cor: "hsl(0, 72%, 51%)" },
  { palavra: "campanha", valor: 18.5, cor: "hsl(0, 72%, 51%)" },
  { palavra: "horizonte", valor: 8.3, cor: "hsl(45, 93%, 47%)" }
];

const miScoreData = [
  { palavra: "verso", valor: 9.2, cor: "hsl(142, 71%, 45%)" },
  { palavra: "tarumã", valor: 8.8, cor: "hsl(142, 71%, 45%)" },
  { palavra: "saudade", valor: 8.5, cor: "hsl(142, 71%, 45%)" },
  { palavra: "galpão", valor: 7.9, cor: "hsl(142, 71%, 45%)" },
  { palavra: "várzea", valor: 7.2, cor: "hsl(142, 71%, 45%)" },
  { palavra: "sonhos", valor: 5.8, cor: "hsl(0, 72%, 51%)" },
  { palavra: "mate", valor: 4.9, cor: "hsl(0, 72%, 51%)" },
  { palavra: "horizonte", valor: 3.2, cor: "hsl(45, 93%, 47%)" }
];

const lematizacaoData = [
  { original: "sonhos", lema: "sonho", classe: "NOUN" },
  { original: "adormecidos", lema: "adormecer", classe: "VERB" },
  { original: "coplas", lema: "copla", classe: "NOUN" },
  { original: "suados", lema: "suado", classe: "ADJ" },
  { original: "vestidos", lema: "vestir", classe: "VERB" },
  { original: "arreios", lema: "arreio", classe: "NOUN" }
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function Analise() {
  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<typeof dominiosData[0] | null>(null);
  
  // Estados para controle de gráficos interativos (Rede e outros)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ==================== HANDLERS ====================

  const handleWordClick = (word: string) => {
    if (isPanning) return;
    setSelectedWord(word);
    setModalOpen(true);
  };
  
  const handleDomainClick = (domainName: string) => {
    const domain = dominiosData.find(d => d.dominio === domainName);
    if (domain) {
      setSelectedDomain(domain);
      setDomainModalOpen(true);
    }
  };

  // Pan handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.classList.contains('pan-area')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleCanvasPanMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  }, [isPanning, panStart]);

  const handleCanvasPanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom handler com PREVENÇÃO de scroll da página quando sobre o gráfico
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // CRÍTICO: Bloquear scroll da página quando sobre o gráfico
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || !svgRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    
    const zoomRatio = newZoom / zoomLevel;
    const newPanX = mouseX - (mouseX - panOffset.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - panOffset.y) * zoomRatio;
    
    setZoomLevel(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [zoomLevel, panOffset]);

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoomLevel + 0.2);
    setZoomLevel(newZoom);
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoomLevel - 0.2);
    setZoomLevel(newZoom);
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ==================== RENDER ====================

  return (
    <div className={`pt-24 px-6 md:px-10 pb-12 space-y-10 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 pt-24' : ''}`}>
      
      {/* HEADER DA PÁGINA */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Quando o verso vem pras casa
          </h1>
          <p className="text-lg text-muted-foreground">
            Análise semântica completa • Luiz Marenco
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* TABS PRINCIPAIS */}
      <Tabs defaultValue="corpus" className="space-y-8">
        
        {/* NAVEGAÇÃO DAS TABS */}
        <TabsList className="grid w-full grid-cols-6 h-auto p-1.5 bg-muted/30">
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
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Estatística</span>
          </TabsTrigger>
          <TabsTrigger value="nuvem" className="gap-2 py-3">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Nuvem</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB: CORPUS ==================== */}
        <TabsContent value="corpus" className="space-y-8">
          <Card className="border-2">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">Visão Geral do Corpus</CardTitle>
                  <CardDescription className="text-base">
                    Estatísticas gerais e informações sobre o corpus analisado
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  1 canção
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Grid de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-card space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Total de Tokens</p>
                  <p className="text-4xl font-bold">170</p>
                  <p className="text-xs text-muted-foreground">Unidades lexicais identificadas</p>
                </div>
                <div className="p-6 border rounded-lg bg-card space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Palavras-Chave</p>
                  <p className="text-4xl font-bold">36</p>
                  <p className="text-xs text-muted-foreground">Significativas no contexto</p>
                </div>
                <div className="p-6 border rounded-lg bg-card space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Densidade Lexical</p>
                  <p className="text-4xl font-bold">68%</p>
                  <p className="text-xs text-muted-foreground">Índice de riqueza vocabular</p>
                </div>
              </div>

              {/* Lematização */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Lematização</h3>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                      <p>Redução das palavras às suas formas canônicas (lemmas) para análise morfológica</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Forma Original</TableHead>
                        <TableHead className="font-semibold">Lemma</TableHead>
                        <TableHead className="font-semibold">Classe Gramatical</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lematizacaoData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{item.original}</TableCell>
                          <TableCell>{item.lema}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.classe}</Badge>
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

        {/* ==================== TAB: DOMÍNIOS ==================== */}
        <TabsContent value="dominios" className="space-y-8">
          <Card className="border-2">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">Domínios Semânticos</CardTitle>
                  <CardDescription className="text-base">
                    Distribuição temática das palavras-chave no corpus
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  5 domínios
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-10">
              
              {/* Gráfico de barras */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Distribuição por Domínio</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dominiosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="dominio" 
                        angle={-15}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'ocorrencias') return [`${value} ocorrências`, 'Total'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          const d = dominiosData.find(dom => dom.dominio === label);
                          return d ? d.nomeCompleto : label;
                        }}
                      />
                      <Bar dataKey="ocorrencias" radius={[8, 8, 0, 0]}>
                        {dominiosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cards de domínios */}
              <TooltipProvider>
                <div className="grid gap-6">
                  {dominiosData.map((dominio, idx) => (
                    <Card key={idx} className="border-2 hover:shadow-lg transition-all">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full shrink-0"
                                style={{ backgroundColor: dominio.cor }}
                              />
                              <CardTitle className="text-xl">{dominio.nomeCompleto}</CardTitle>
                            </div>
                            <CardDescription className="text-sm italic">
                              {dominio.fragmento}
                            </CardDescription>
                          </div>
                          <UITooltip>
                            <TooltipTrigger>
                              <Badge 
                                variant="outline" 
                                className="gap-1.5 px-3 py-1.5 cursor-help"
                                style={{ 
                                  borderColor: dominio.cor,
                                  color: dominio.corTexto,
                                  backgroundColor: `${dominio.cor}20`
                                }}
                              >
                                {dominio.percentual}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                              <div className="space-y-1.5">
                                <p className="font-semibold">Representatividade: {dominio.percentual}%</p>
                                <p className="text-xs">Densidade lexical: {(dominio.ocorrencias / 170 * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground mt-2">{dominio.descricao}</p>
                              </div>
                            </TooltipContent>
                          </UITooltip>
                        </div>
                      </CardHeader>
                      <CardContent>
                        
                        {/* Barra de progresso */}
                        <div className="mb-5">
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700 animate-shimmer"
                              style={{ 
                                width: `${dominio.percentual}%`,
                                backgroundColor: dominio.cor
                              }}
                            />
                          </div>
                        </div>

                        {/* Palavras do domínio */}
                        <div className="flex flex-wrap gap-2">
                          {dominio.palavras.map((palavra, widx) => {
                            const stats = palavrasChaveData.find(p => p.palavra === palavra);
                            return (
                              <UITooltip key={widx}>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="secondary"
                                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5 text-sm"
                                    onClick={() => handleWordClick(palavra)}
                                    style={{
                                      backgroundColor: `${dominio.cor}30`,
                                      color: dominio.corTexto,
                                      borderColor: dominio.cor
                                    }}
                                  >
                                    {palavra}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-popover text-popover-foreground z-50">
                                  <div className="space-y-2 min-w-[200px]">
                                    <p className="font-bold text-base">{palavra}</p>
                                    {stats && (
                                      <>
                                        <div className="space-y-1 text-xs pt-2 border-t">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Frequência:</span>
                                            <span className="font-semibold">{stats.frequenciaBruta}x</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Significância:</span>
                                            <span className="font-semibold">{stats.significancia}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Efeito:</span>
                                            <span className="font-semibold flex items-center gap-1">
                                              {stats.efeito}
                                              <stats.efeitoIcon className="h-3 w-3" />
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-2 border-t">
                                          Clique para ver contexto (KWIC)
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </TooltipContent>
                              </UITooltip>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TooltipProvider>

              {/* Insights */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Insights da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Domínio Dominante</p>
                      <p className="text-sm text-muted-foreground">
                        "Natureza e Paisagem Campeira" lidera com {dominiosData[0].percentual}%, 
                        evidenciando a centralidade do ambiente pampeano na construção poética.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Coesão Semântica</p>
                      <p className="text-sm text-muted-foreground">
                        Os 5 domínios cobrem {dominiosData.reduce((acc, d) => acc + d.percentual, 0).toFixed(1)}% 
                        do corpus, demonstrando forte unidade temática.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB: REDE ==================== */}
        <TabsContent value="rede" className="space-y-8">
          <Card className="border-2">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">Rede Semântica Interativa</CardTitle>
                  <CardDescription className="text-base">
                    Visualização da força de associação entre palavras-chave no corpus
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                  <Network className="h-3.5 w-3.5" />
                  6 conexões
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Instruções */}
              <div className="p-5 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Sistema Orbital Hierárquico
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>(1)</strong> Clique em "Canção Analisada" para ver os sistemas orbitais • 
                  <strong>(2)</strong> Clique em um sistema para ver detalhes
                </p>
              </div>

              {/* Visualização Orbital */}
              <OrbitalConstellationChart 
                songName="Quando o verso vem pras casa"
                artistName="Luiz Marenco"
              />

              {/* Análise de Prosódia Semântica */}
              <div className="space-y-6 pt-6 border-t">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Análise de Prosódia Semântica</h3>
                  <p className="text-sm text-muted-foreground">
                    A "aura" emocional que uma palavra adquire pelo contexto em que consistentemente aparece no corpus
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Verso - Protagonista */}
                  <div className="p-5 border-2 rounded-lg bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-bold text-2xl">verso</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Protagonista Personificado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Personificado como o gaúcho, representa a alma do homem do campo. 
                      Associa-se à jornada, ao descanso, à tradição e aos sonhos.
                    </p>
                    <div className="space-y-3">
                      {[
                        { palavra: "campereada", porcentagem: 92 },
                        { palavra: "desencilhou", porcentagem: 88 },
                        { palavra: "sonhos", porcentagem: 85 },
                        { palavra: "campeira", porcentagem: 82 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.palavra}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${item.porcentagem}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {item.porcentagem}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saudade - Dor e Nostalgia */}
                  <div className="p-5 border-2 rounded-lg bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-bold text-2xl">saudade</span>
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        Dor e Nostalgia
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sentimento central elevado a força da natureza. 
                      "Feito açoite" (dor física, castigo) e "redomona" (indomável, selvagem).
                    </p>
                    <div className="space-y-3">
                      {[
                        { palavra: "açoite", porcentagem: 95 },
                        { palavra: "redomona", porcentagem: 93 },
                        { palavra: "galpão", porcentagem: 87 },
                        { palavra: "olhos negros", porcentagem: 81 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.palavra}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-destructive rounded-full transition-all"
                                style={{ width: `${item.porcentagem}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {item.porcentagem}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sonhos - Refúgio */}
                  <div className="p-5 border-2 rounded-lg bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-bold text-2xl">sonhos</span>
                      <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        Refúgio e Frustração
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Desejo de pertencimento e integração com a paisagem campeira. 
                      Evasão da realidade, mas também perda ("tropa se desgarrou").
                    </p>
                    <div className="space-y-3">
                      {[
                        { palavra: "várzea", porcentagem: 89 },
                        { palavra: "prenda", porcentagem: 86 },
                        { palavra: "gateado", porcentagem: 84 },
                        { palavra: "desgarrou", porcentagem: 78 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.palavra}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${item.porcentagem}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {item.porcentagem}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Rede Semântica Interativa */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Rede de Coocorrência</CardTitle>
              <CardDescription>
                Arraste os nós • Role para zoom • Clique para estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveSemanticNetwork onWordClick={handleWordClick} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB: FREQUÊNCIA ==================== */}
        <TabsContent value="frequencia" className="space-y-8">
          <Card className="border-2">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">Análise de Frequência</CardTitle>
                  <CardDescription className="text-base">
                    Distribuição e ranking das palavras mais frequentes no corpus
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                  <FileBarChart className="h-3.5 w-3.5" />
                  Top 10
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Tabela de palavras-chave */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Palavras-Chave por Frequência</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold w-12">#</TableHead>
                        <TableHead className="font-semibold">Palavra</TableHead>
                        <TableHead className="font-semibold text-right">Freq. Bruta</TableHead>
                        <TableHead className="font-semibold text-right">Freq. Normalizada</TableHead>
                        <TableHead className="font-semibold">Significância</TableHead>
                        <TableHead className="font-semibold">Efeito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {palavrasChaveData.slice(0, 10).map((item, index) => (
                        <TableRow 
                          key={index} 
                          className="hover:bg-muted/20 cursor-pointer"
                          onClick={() => handleWordClick(item.palavra)}
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-semibold">{item.palavra}</TableCell>
                          <TableCell className="text-right">{item.frequenciaBruta}</TableCell>
                          <TableCell className="text-right">{item.frequenciaNormalizada.toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                item.significancia === "Alta" ? "default" : 
                                item.significancia === "Média" ? "secondary" : "outline"
                              }
                            >
                              {item.significancia}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <item.efeitoIcon className="h-4 w-4" />
                              <span>{item.efeito}</span>
                            </div>
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

        {/* ==================== TAB: ESTATÍSTICA ==================== */}
        <TabsContent value="estatistica" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Log-Likelihood */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Log-Likelihood</CardTitle>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                      <p>Teste estatístico que mede a significância da diferença de frequência entre o corpus e um corpus de referência</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <CardDescription>
                  Significância estatística das palavras-chave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={logLikelihoodData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis dataKey="palavra" type="category" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                      />
                      <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                        {logLikelihoodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* MI Score */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">MI Score</CardTitle>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                      <p>Mutual Information: mede o grau de associação entre palavras</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <CardDescription>
                  Força de associação semântica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miScoreData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis dataKey="palavra" type="category" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                      />
                      <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                        {miScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB: NUVEM ==================== */}
        <TabsContent value="nuvem" className="space-y-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Nuvem de Palavras</CardTitle>
              <CardDescription className="text-base">
                Visualização proporcional das palavras mais relevantes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* ==================== MODALS ==================== */}
      
      {/* Modal KWIC */}
      <KWICModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        word={selectedWord}
        data={kwicDataMap[selectedWord] || []}
      />

      {/* Modal de Domínio */}
      <Dialog open={domainModalOpen} onOpenChange={setDomainModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedDomain?.nomeCompleto}
            </DialogTitle>
            <DialogDescription>
              {selectedDomain?.descricao}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="text-center p-4 border rounded-lg flex-1">
                <p className="text-2xl font-bold">{selectedDomain?.ocorrencias}</p>
                <p className="text-sm text-muted-foreground">Ocorrências</p>
              </div>
              <div className="text-center p-4 border rounded-lg flex-1">
                <p className="text-2xl font-bold">{selectedDomain?.percentual}%</p>
                <p className="text-sm text-muted-foreground">Do Corpus</p>
              </div>
              <div className="text-center p-4 border rounded-lg flex-1">
                <p className="text-2xl font-bold">{selectedDomain?.palavras.length}</p>
                <p className="text-sm text-muted-foreground">Palavras</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Palavras-Chave</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDomain?.palavras.map((palavra, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5"
                    onClick={() => {
                      setDomainModalOpen(false);
                      handleWordClick(palavra);
                    }}
                  >
                    {palavra}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm italic text-muted-foreground">
                {selectedDomain?.fragmento}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

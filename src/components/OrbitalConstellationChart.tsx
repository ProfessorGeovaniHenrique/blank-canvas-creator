import { Badge } from "@/components/ui/badge";

interface WordData {
  word: string;
  strength: number;
  category: string;
  color: string;
}

interface OrbitalSystem {
  centerWord: string;
  words: WordData[];
}

interface OrbitalConstellationChartProps {
  centerWord?: string;
}

export const OrbitalConstellationChart = ({ 
  centerWord = "verso" 
}: OrbitalConstellationChartProps) => {
  // Cores da análise de prosódia semântica e mapeamento de cores por palavra central
  const centerWordColors: Record<string, string> = {
    "verso": "hsl(var(--primary))", // Protagonista Personificado
    "saudade": "hsl(var(--destructive))", // Dor e Nostalgia
    "sonhos": "#a855f7", // Refúgio e Frustração (purple)
    "cansado": "#f59e0b", // Fim de Ciclo (amber)
    "silêncio": "#64748b", // Solidão e Abandono (slate)
    "arreios": "#3b82f6", // Extensão de Identidade (blue)
  };

  // Definição dos 6 sistemas orbitais
  const orbitalSystems: OrbitalSystem[] = [
    {
      centerWord: "verso",
      words: [
        { word: "campereada", strength: 92, category: "Protagonista Personificado", color: "hsl(var(--primary))" },
        { word: "desencilhou", strength: 88, category: "Protagonista Personificado", color: "hsl(var(--primary))" },
        { word: "sonhos", strength: 85, category: "Protagonista Personificado", color: "hsl(var(--primary))" },
        { word: "campeira", strength: 82, category: "Protagonista Personificado", color: "hsl(var(--primary))" },
      ]
    },
    {
      centerWord: "saudade",
      words: [
        { word: "açoite", strength: 95, category: "Dor e Nostalgia", color: "hsl(var(--destructive))" },
        { word: "redomona", strength: 93, category: "Dor e Nostalgia", color: "hsl(var(--destructive))" },
        { word: "galpão", strength: 87, category: "Dor e Nostalgia", color: "hsl(var(--destructive))" },
        { word: "olhos negros", strength: 81, category: "Dor e Nostalgia", color: "hsl(var(--destructive))" },
      ]
    },
    {
      centerWord: "sonhos",
      words: [
        { word: "várzea", strength: 89, category: "Refúgio e Frustração", color: "#a855f7" },
        { word: "prenda", strength: 86, category: "Refúgio e Frustração", color: "#a855f7" },
        { word: "gateado", strength: 84, category: "Refúgio e Frustração", color: "#a855f7" },
        { word: "desgarrou", strength: 78, category: "Refúgio e Frustração", color: "#a855f7" },
      ]
    },
    {
      centerWord: "cansado",
      words: [
        { word: "caindo", strength: 91, category: "Fim de Ciclo", color: "#f59e0b" },
        { word: "lonjuras", strength: 88, category: "Fim de Ciclo", color: "#f59e0b" },
        { word: "tarde", strength: 85, category: "Fim de Ciclo", color: "#f59e0b" },
        { word: "ramada", strength: 78, category: "Fim de Ciclo", color: "#f59e0b" },
      ]
    },
    {
      centerWord: "silêncio",
      words: [
        { word: "desgarrou", strength: 94, category: "Solidão e Abandono", color: "#64748b" },
        { word: "esporas", strength: 90, category: "Solidão e Abandono", color: "#64748b" },
        { word: "encostada", strength: 86, category: "Solidão e Abandono", color: "#64748b" },
        { word: "recostada", strength: 82, category: "Solidão e Abandono", color: "#64748b" },
      ]
    },
    {
      centerWord: "arreios",
      words: [
        { word: "suados", strength: 93, category: "Extensão de Identidade", color: "#3b82f6" },
        { word: "gateada", strength: 88, category: "Extensão de Identidade", color: "#3b82f6" },
        { word: "respeito", strength: 85, category: "Extensão de Identidade", color: "#3b82f6" },
        { word: "querência", strength: 79, category: "Extensão de Identidade", color: "#3b82f6" },
      ]
    },
  ];

  // Calcula a órbita baseado na força (90-100% = órbita 1, 80-89% = órbita 2, etc)
  const getOrbit = (strength: number) => {
    if (strength >= 90) return 1;
    if (strength >= 80) return 2;
    if (strength >= 70) return 3;
    return 4;
  };

  const orbitRadii = {
    1: 35,
    2: 55,
    3: 75,
    4: 95,
  };

  // Renderiza um sistema orbital individual
  const renderOrbitalSystem = (system: OrbitalSystem, centerX: number, centerY: number) => {
    // Organiza palavras por órbita
    const wordsByOrbit = system.words.reduce((acc, word) => {
      const orbit = getOrbit(word.strength);
      if (!acc[orbit]) acc[orbit] = [];
      acc[orbit].push(word);
      return acc;
    }, {} as Record<number, WordData[]>);

    // Calcula posição de cada palavra em sua órbita
    const getWordPosition = (word: WordData, index: number, totalInOrbit: number) => {
      const orbit = getOrbit(word.strength);
      const radius = orbitRadii[orbit as keyof typeof orbitRadii];
      const angle = (index / totalInOrbit) * 2 * Math.PI - Math.PI / 2;
      
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    };

    return (
      <g key={system.centerWord}>
        {/* Órbitas (círculos concêntricos) */}
        {[1, 2, 3].map((orbit) => (
          <circle
            key={`${system.centerWord}-orbit-${orbit}`}
            cx={centerX}
            cy={centerY}
            r={orbitRadii[orbit as keyof typeof orbitRadii]}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity={0.2}
          />
        ))}

        {/* Linhas conectando palavras ao centro */}
        {Object.entries(wordsByOrbit).map(([orbit, wordsInOrbit]) =>
          wordsInOrbit.map((word, index) => {
            const pos = getWordPosition(word, index, wordsInOrbit.length);
            return (
              <line
                key={`line-${system.centerWord}-${word.word}-${index}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={word.color}
                strokeWidth="0.5"
                opacity="0.15"
              />
            );
          })
        )}

        {/* Palavra central */}
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r="18"
            fill={centerWordColors[system.centerWord]}
            opacity="0.9"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-primary-foreground font-bold text-sm"
          >
            {system.centerWord}
          </text>
        </g>

        {/* Palavras orbitando */}
        {Object.entries(wordsByOrbit).map(([orbit, wordsInOrbit]) =>
          wordsInOrbit.map((word, index) => {
            const pos = getWordPosition(word, index, wordsInOrbit.length);
            return (
              <g key={`word-${system.centerWord}-${word.word}-${index}`}>
                {/* Glow effect */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill={word.color}
                  opacity="0.2"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={word.color}
                  opacity="1"
                  stroke="hsl(var(--background))"
                  strokeWidth="0.5"
                />
                <text
                  x={pos.x}
                  y={pos.y - 9}
                  textAnchor="middle"
                  className="fill-foreground font-medium"
                  style={{ fontSize: '8px' }}
                >
                  {word.word}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 13}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: '7px' }}
                >
                  {word.strength}%
                </text>
              </g>
            );
          })
        )}
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full bg-gradient-to-br from-background to-muted/20 rounded-lg border p-4 overflow-hidden">
        <svg width="1200" height="700" viewBox="0 0 1200 700" className="w-full h-auto">
          {/* Grid de sistemas orbitais: 3 colunas x 2 linhas */}
          {orbitalSystems.map((system, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = 200 + col * 400;
            const y = 180 + row * 350;
            
            return renderOrbitalSystem(system, x, y);
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
          <span>Protagonista Personificado</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))" }} />
          <span>Dor e Nostalgia</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#a855f7" }} />
          <span>Refúgio e Frustração</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span>Fim de Ciclo</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#64748b" }} />
          <span>Solidão e Abandono</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
          <span>Extensão de Identidade</span>
        </div>
      </div>

      {/* Explicação das órbitas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Órbita Interna</div>
          <div className="text-muted-foreground">90-100%</div>
        </div>
        <div className="p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Órbita Intermediária</div>
          <div className="text-muted-foreground">80-89%</div>
        </div>
        <div className="p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Órbita Externa</div>
          <div className="text-muted-foreground">70-79%</div>
        </div>
        <div className="p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Órbita Periférica</div>
          <div className="text-muted-foreground">&lt;70%</div>
        </div>
      </div>
    </div>
  );
};

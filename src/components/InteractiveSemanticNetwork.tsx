import { useState, useRef, useEffect, useCallback } from "react";
// Assumindo que 'Badge' é um componente de UI e não é diretamente relevante para a lógica de arrastar
// import { Badge } from "./ui/badge";

interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  distance: number; // força de associação (0-1, menor = mais forte)
  frequency: number; // frequência no corpus
}

interface InteractiveSemanticNetworkProps {
  onWordClick: (word: string) => void;
}

const prosodyColors = {
  positive: "hsl(142, 35%, 25%)",
  neutral: "hsl(221, 40%, 25%)",
  melancholic: "hsl(45, 40%, 25%)",
  contemplative: "hsl(291, 35%, 25%)",
};

const prosodyTextColors = {
  positive: "hsl(142, 80%, 75%)",
  neutral: "hsl(221, 85%, 75%)",
  melancholic: "hsl(45, 95%, 75%)",
  contemplative: "hsl(291, 75%, 75%)",
};

const MIN_ORBIT_RADIUS = 120; // distância mínima da palavra-chave (em pixels)

export function InteractiveSemanticNetwork({ onWordClick }: InteractiveSemanticNetworkProps) {
  const [nodes, setNodes] = useState<NetworkNode[]>([
    // Palavra-chave central
    { id: "verso", label: "verso", x: 300, y: 200, distance: 0, prosody: "contemplative", frequency: 45 },
    // Órbita 1 - Associação muito forte (distance 0.08-0.15)
    { id: "saudade", label: "saudade", x: 300, y: 80, distance: 0.08, prosody: "melancholic", frequency: 42 },
    { id: "tarumã", label: "tarumã", x: 450, y: 120, distance: 0.12, prosody: "neutral", frequency: 38 },
    { id: "galpão", label: "galpão", x: 470, y: 240, distance: 0.15, prosody: "neutral", frequency: 35 },
    // Órbita 2 - Associação forte (distance 0.20-0.30)
    { id: "várzea", label: "várzea", x: 430, y: 340, distance: 0.22, prosody: "positive", frequency: 28 },
    { id: "sonhos", label: "sonhos", x: 300, y: 370, distance: 0.25, prosody: "contemplative", frequency: 26 },
    { id: "coxilha", label: "coxilha", x: 160, y: 340, distance: 0.28, prosody: "positive", frequency: 24 },
    { id: "mate", label: "mate", x: 100, y: 240, distance: 0.3, prosody: "neutral", frequency: 22 },
    // Órbita 3 - Associação moderada (distance 0.35-0.45)
    { id: "gateada", label: "gateada", x: 100, y: 130, distance: 0.35, prosody: "neutral", frequency: 18 },
    { id: "campanha", label: "campanha", x: 180, y: 70, distance: 0.38, prosody: "positive", frequency: 16 },
    { id: "querência", label: "querência", x: 360, y: 50, distance: 0.4, prosody: "contemplative", frequency: 15 },
    { id: "prenda", label: "prenda", x: 500, y: 180, distance: 0.43, prosody: "positive", frequency: 14 },
    // Órbita 4 - Associação fraca (distance 0.50-0.65)
    { id: "arreios", label: "arreios", x: 520, y: 300, distance: 0.5, prosody: "neutral", frequency: 12 },
    { id: "coplas", label: "coplas", x: 420, y: 380, distance: 0.55, prosody: "contemplative", frequency: 11 },
    { id: "mansidão", label: "mansidão", x: 180, y: 380, distance: 0.58, prosody: "contemplative", frequency: 10 },
    { id: "maragato", label: "maragato", x: 80, y: 300, distance: 0.62, prosody: "neutral", frequency: 9 },
    { id: "esporas", label: "esporas", x: 80, y: 180, distance: 0.65, prosody: "neutral", frequency: 8 },
  ]);

  const [dragging, setDragging] = useState<string | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes); // Ref para manter a versão mais recente do estado 'nodes'

  // Efeito para manter nodesRef.current sempre atualizado com o estado 'nodes'
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault(); // Previne o comportamento padrão de arrastar do navegador
    console.log("handleMouseDown called for:", nodeId); // Log de debug
    if (nodesRef.current.find((n) => n.id === nodeId)?.distance === 0) {
      // Impede que o nó central (distance === 0) seja arrastado
      return;
    }
    setDragging(nodeId);
    setHasDragged(false);
  };

  // Usamos useCallback para memoizar handleMouseUp, pois suas dependências são estáveis
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Usamos useCallback para memoizar handleMouseMove.
  // Ele acessará 'nodes' através de nodesRef.current para ter a versão mais recente.
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging && containerRef.current) {
        setHasDragged(true);
        const rect = containerRef.current.getBoundingClientRect();
        const currentNodes = nodesRef.current; // Acessa a versão mais recente de 'nodes' via ref
        const centerNode = currentNodes.find((n) => n.distance === 0);
        const draggedNode = currentNodes.find((n) => n.id === dragging);

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calcula ângulo do mouse em relação ao centro
        const angle = Math.atan2(mouseY - centerNode.y, mouseX - centerNode.x);

        // Mantém a distância fixa baseada na força de associação com mínimo
        const radius = Math.max(MIN_ORBIT_RADIUS, MIN_ORBIT_RADIUS + draggedNode.distance * 150);

        // Nova posição orbital mantendo a distância
        const newX = centerNode.x + Math.cos(angle) * radius;
        const newY = centerNode.y + Math.sin(angle) * radius;

        setNodes((prev) =>
          prev.map((node) =>
            node.id === dragging
              ? {
                  ...node,
                  x: newX,
                  y: newY,
                }
              : node,
          ),
        );
      }
    },
    [dragging],
  ); // Depende apenas de 'dragging' e 'containerRef' (que é estável). 'nodes' é acessado via ref.

  const handleClick = (nodeId: string, label: string) => {
    if (!hasDragged) {
      onWordClick(label);
    }
  };

  // Efeito para adicionar e remover listeners de eventos globais (document)
  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]); // Dependências são as funções de callback memoizadas

  const centerNode = nodes.find((n) => n.distance === 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        💡 Arraste as palavras para reorganizar. A distância reflete a força de associação.
      </div>

      <div
        ref={containerRef}
        className="border border-border rounded-lg bg-background/50 overflow-hidden"
        style={{ width: "100%", height: "500px", position: "relative" }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Renderizar linhas de conexão */}
          {nodes.map((node) => {
            return (
              <line
                key={`line-${node.id}`}
                x1={centerNode.x}
                y1={centerNode.y}
                x2={node.x}
                y2={node.y}
                stroke={prosodyColors[node.prosody]}
                strokeWidth="2"
                opacity="0.3"
                pointerEvents="none" // Importante: impede que as linhas bloqueiem eventos de mouse nos nós
              />
            );
          })}

          {/* Renderizar nós */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill={prosodyColors[node.prosody]}
                stroke={prosodyTextColors[node.prosody]}
                strokeWidth="2"
                style={{
                  cursor: node.distance === 0 ? "default" : "grab",
                  opacity: dragging && dragging !== node.id ? 0.5 : 1,
                  transition: dragging === node.id ? "none" : "opacity 0.2s",
                  userSelect: "none",
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => handleClick(node.id, node.label)}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central" // Correção: centraliza o texto verticalmente
                fill={prosodyTextColors[node.prosody]}
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none" // Impede que o texto bloqueie eventos de mouse no círculo
                style={{ userSelect: "none" }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

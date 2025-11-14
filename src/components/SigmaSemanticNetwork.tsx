import React, { useEffect, useRef, useState, useCallback } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, ZoomIn, ZoomOut } from 'lucide-react';
import { KWICModal } from './KWICModal';

// Types
type ViewLevel = 'universe' | 'galaxy' | 'constellation';

interface SemanticDomain {
  id: string;
  name: string;
  color: string;
  words: Array<{
    word: string;
    frequency: number;
    strength: number;
  }>;
}

interface BreadcrumbItem {
  level: ViewLevel;
  label: string;
  domainId?: string;
}

// Mock data - estrutura preparada para receber dados reais
const SEMANTIC_DOMAINS: SemanticDomain[] = [
  {
    id: 'tradition',
    name: 'Tradição Gaúcha',
    color: '#D97706',
    words: [
      { word: 'gaúcho', frequency: 45, strength: 0.95 },
      { word: 'pampa', frequency: 32, strength: 0.88 },
      { word: 'campo', frequency: 28, strength: 0.82 },
      { word: 'tradição', frequency: 24, strength: 0.79 },
      { word: 'raiz', frequency: 20, strength: 0.75 }
    ]
  },
  {
    id: 'sentiment',
    name: 'Sentimento',
    color: '#8B5CF6',
    words: [
      { word: 'saudade', frequency: 38, strength: 0.92 },
      { word: 'coração', frequency: 30, strength: 0.85 },
      { word: 'amor', frequency: 26, strength: 0.81 },
      { word: 'alma', frequency: 22, strength: 0.77 },
      { word: 'sentir', frequency: 18, strength: 0.73 }
    ]
  },
  {
    id: 'nature',
    name: 'Natureza',
    color: '#10B981',
    words: [
      { word: 'céu', frequency: 35, strength: 0.90 },
      { word: 'terra', frequency: 29, strength: 0.84 },
      { word: 'vento', frequency: 25, strength: 0.80 },
      { word: 'sol', frequency: 21, strength: 0.76 },
      { word: 'lua', frequency: 17, strength: 0.72 }
    ]
  },
  {
    id: 'music',
    name: 'Música',
    color: '#EF4444',
    words: [
      { word: 'canto', frequency: 33, strength: 0.89 },
      { word: 'verso', frequency: 27, strength: 0.83 },
      { word: 'violão', frequency: 23, strength: 0.78 },
      { word: 'melodia', frequency: 19, strength: 0.74 },
      { word: 'canção', frequency: 15, strength: 0.70 }
    ]
  }
];

const SONG_DATA = {
  title: 'Quando o verso vem pras casa',
  artist: 'Luiz Marenco',
  totalWords: 450
};

// Mock KWIC data
const getMockKWICData = (word: string) => [
  {
    leftContext: `contexto antes de`,
    keyword: word,
    rightContext: `contexto depois da palavra`,
    source: `${SONG_DATA.artist} - ${SONG_DATA.title}`
  },
  {
    leftContext: `outro contexto com`,
    keyword: word,
    rightContext: `mais contexto aqui`,
    source: `${SONG_DATA.artist} - ${SONG_DATA.title}`
  }
];

export const SigmaSemanticNetwork: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<any>(null);

  const [viewLevel, setViewLevel] = useState<ViewLevel>('universe');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { level: 'universe', label: 'Universo' }
  ]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [kwicModalOpen, setKwicModalOpen] = useState(false);

  // Initialize graph and sigma
  const initializeSigma = useCallback(() => {
    if (!containerRef.current) return;

    // Create new graph
    const graph = new Graph();
    graphRef.current = graph;

    // Create sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultNodeColor: '#999',
      defaultEdgeColor: '#ccc',
      labelFont: 'Inter, sans-serif',
      labelSize: 12,
      labelWeight: '500',
      enableEdgeEvents: true,
    });

    sigmaRef.current = sigma;

    // Event handlers
    sigma.on('clickNode', ({ node }) => {
      handleNodeClick(node);
    });

    return () => {
      sigma.kill();
    };
  }, []);

  // Build Universe view
  const buildUniverseView = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.clear();

    // Central song node
    graph.addNode('song', {
      label: SONG_DATA.title,
      x: 0,
      y: 0,
      size: 30,
      color: '#3B82F6',
      type: 'song',
      borderColor: '#60A5FA',
      borderSize: 3,
    });

    // Add all words from all domains in orbit
    let wordIndex = 0;
    const totalWords = SEMANTIC_DOMAINS.reduce((acc, d) => acc + d.words.length, 0);
    
    SEMANTIC_DOMAINS.forEach((domain) => {
      domain.words.forEach((wordData) => {
        const angle = (wordIndex / totalWords) * Math.PI * 2;
        const radius = 150 + Math.random() * 100;
        
        graph.addNode(wordData.word, {
          label: wordData.word,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 8 + wordData.frequency / 10,
          color: domain.color,
          type: 'word',
          domain: domain.id,
          frequency: wordData.frequency,
        });

        graph.addEdge('song', wordData.word, {
          size: 1,
          color: domain.color + '40',
        });

        wordIndex++;
      });
    });

    sigmaRef.current?.refresh();
  }, []);

  // Build Galaxy view
  const buildGalaxyView = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.clear();

    // Add domain nodes as "stars"
    SEMANTIC_DOMAINS.forEach((domain, index) => {
      const angle = (index / SEMANTIC_DOMAINS.length) * Math.PI * 2;
      const radius = 200;

      graph.addNode(domain.id, {
        label: domain.name,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 25 + domain.words.length,
        color: domain.color,
        type: 'domain',
        borderColor: domain.color,
        borderSize: 2,
      });
    });

    // Create connections between domains
    for (let i = 0; i < SEMANTIC_DOMAINS.length - 1; i++) {
      graph.addEdge(SEMANTIC_DOMAINS[i].id, SEMANTIC_DOMAINS[i + 1].id, {
        size: 0.5,
        color: '#666666',
      });
    }

    sigmaRef.current?.refresh();
  }, []);

  // Build Constellation view
  const buildConstellationView = useCallback((domainId: string) => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.clear();

    const domain = SEMANTIC_DOMAINS.find(d => d.id === domainId);
    if (!domain) return;

    // Central domain node (star)
    graph.addNode(domain.id, {
      label: domain.name,
      x: 0,
      y: 0,
      size: 35,
      color: domain.color,
      type: 'domain-center',
      borderColor: domain.color,
      borderSize: 3,
    });

    // Add words as planets in orbit
    domain.words.forEach((wordData, index) => {
      const angle = (index / domain.words.length) * Math.PI * 2;
      const radius = 80 + wordData.strength * 100;

      graph.addNode(wordData.word, {
        label: wordData.word,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 12 + wordData.frequency / 5,
        color: domain.color,
        type: 'word',
        frequency: wordData.frequency,
        strength: wordData.strength,
        borderColor: '#FFFFFF',
        borderSize: 1,
      });

      graph.addEdge(domain.id, wordData.word, {
        size: 1.5,
        color: domain.color + '60',
      });
    });

    sigmaRef.current?.refresh();
  }, []);

  // Update view based on level
  useEffect(() => {
    if (!graphRef.current) return;

    switch (viewLevel) {
      case 'universe':
        buildUniverseView();
        break;
      case 'galaxy':
        buildGalaxyView();
        break;
      case 'constellation':
        if (selectedDomain) {
          buildConstellationView(selectedDomain);
        }
        break;
    }
  }, [viewLevel, selectedDomain, buildUniverseView, buildGalaxyView, buildConstellationView]);

  // Initialize on mount
  useEffect(() => {
    const cleanup = initializeSigma();
    return cleanup;
  }, [initializeSigma]);

  // Handle node clicks
  const handleNodeClick = (nodeId: string) => {
    const graph = graphRef.current;
    if (!graph || !graph.hasNode(nodeId)) return;

    const nodeType = graph.getNodeAttribute(nodeId, 'type');

    if (viewLevel === 'universe' && nodeType === 'song') {
      // Navigate to galaxy view
      setViewLevel('galaxy');
      setBreadcrumbs([
        { level: 'universe', label: 'Universo' },
        { level: 'galaxy', label: 'Galáxia' }
      ]);
    } else if (viewLevel === 'galaxy' && nodeType === 'domain') {
      // Navigate to constellation view
      setSelectedDomain(nodeId);
      setViewLevel('constellation');
      const domain = SEMANTIC_DOMAINS.find(d => d.id === nodeId);
      setBreadcrumbs([
        { level: 'universe', label: 'Universo' },
        { level: 'galaxy', label: 'Galáxia' },
        { level: 'constellation', label: domain?.name || 'Constelação', domainId: nodeId }
      ]);
    } else if (nodeType === 'word') {
      // Show KWIC modal
      setSelectedWord(nodeId);
      setKwicModalOpen(true);
    }
  };

  // Navigation handlers
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    setViewLevel(item.level);
    if (item.level === 'constellation' && item.domainId) {
      setSelectedDomain(item.domainId);
    }
    const index = breadcrumbs.findIndex(b => b.level === item.level);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const lastItem = newBreadcrumbs[newBreadcrumbs.length - 1];
      setBreadcrumbs(newBreadcrumbs);
      setViewLevel(lastItem.level);
      if (lastItem.domainId) {
        setSelectedDomain(lastItem.domainId);
      }
    }
  };

  const handleZoomIn = () => {
    const camera = sigmaRef.current?.getCamera();
    if (camera) {
      camera.animatedZoom({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    const camera = sigmaRef.current?.getCamera();
    if (camera) {
      camera.animatedUnzoom({ duration: 300 });
    }
  };

  const handleResetView = () => {
    const camera = sigmaRef.current?.getCamera();
    if (camera) {
      camera.animatedReset({ duration: 500 });
    }
  };

  return (
    <div className="relative w-full h-[800px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {breadcrumbs.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.level}>
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(item)}
                    className={`hover:text-primary transition-colors ${
                      index === breadcrumbs.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {SONG_DATA.artist} - {SONG_DATA.title}
          </div>
        </div>
      </div>

      {/* Sigma Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Zoom Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2 bg-background/90 backdrop-blur-md border border-border rounded-xl p-2 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          className="h-8 w-8"
          title="Resetar visualização"
        >
          <Home className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8"
          title="Aumentar zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8"
          title="Diminuir zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* KWIC Modal */}
      {selectedWord && (
        <KWICModal
          word={selectedWord}
          open={kwicModalOpen}
          onOpenChange={setKwicModalOpen}
          data={getMockKWICData(selectedWord)}
        />
      )}
    </div>
  );
};
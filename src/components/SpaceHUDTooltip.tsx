interface SpaceHUDTooltipProps {
  word: {
    id: string;
    label: string;
    freq?: number;
    normalized?: number;
    logLikelihood?: number;
    prosody?: string;
    sentiment?: string;
    miScore?: number;
    associationStrength?: number;
    level?: string;
    // Galaxy level fields
    riquezaLexical?: number;
    pesoTextual?: number;
    percentualTematico?: number;
    comparacaoCorpus?: 'super-representado' | 'equilibrado' | 'sub-representado';
    diferencaCorpus?: number;
    numRings?: number;
  } | null;
  position: { x: number; y: number };
  visible: boolean;
  containerRect?: DOMRect;
  level?: string;
}

export const SpaceHUDTooltip = ({ word, position, visible, containerRect, level }: SpaceHUDTooltipProps) => {
  if (!visible || !word) return null;

  // Smart positioning to avoid UI collision
  const calculateSmartPosition = () => {
    const tooltipWidth = 300;
    const tooltipHeight = 250;
    const offset = 20;
    
    let x = position.x + offset;
    let y = position.y - 140;
    
    if (containerRect) {
      // Detect collision with top navigation console (first 120px)
      if (y < 120) {
        y = position.y + offset; // Move below cursor
      }
      
      // Detect collision with right zoom controls (last 100px)
      if (x + tooltipWidth > containerRect.width - 100) {
        x = position.x - tooltipWidth - offset; // Move to left of cursor
      }
      
      // Detect collision with bottom edge
      if (y + tooltipHeight > containerRect.height) {
        y = containerRect.height - tooltipHeight - 20;
      }
      
      // Detect collision with left edge
      if (x < 20) {
        x = 20;
      }
    }
    
    return { x, y };
  };

  const smartPos = calculateSmartPosition();
  
  const getProsodyColor = (prosody?: string) => {
    switch (prosody?.toLowerCase()) {
      case 'positiva':
      case 'positive':
        return '#1B5E20';
      case 'negativa':
      case 'negative':
        return '#C62828';
      default:
        return '#F57F17';
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-[100] animate-fade-in"
      style={{
        left: smartPos.x,
        top: smartPos.y,
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.98), rgba(0, 229, 255, 0.2))',
        border: '2px solid #00E5FF',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '300px',
        boxShadow: '0 0 25px rgba(0, 229, 255, 0.4), inset 0 0 15px rgba(0, 229, 255, 0.1)',
        fontFamily: 'monospace'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b border-cyan-400/30 pb-2 mb-3">
        <div className="flex flex-col">
          <span className="text-yellow-400 font-bold text-lg tracking-wider">
            [ {word.label.toUpperCase()} ]
          </span>
          <span className="text-cyan-300/60 text-[10px] tracking-widest mt-1">
            ID: {word.id}
          </span>
        </div>
        <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#00E5FF', boxShadow: '0 0 10px #00E5FF' }}></div>
      </div>

      {/* Stats Grid - Universe level */}
      {level !== 'galaxy' && (
        <div className="space-y-2.5">
          {/* Frequência */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-300/80 uppercase tracking-wide">Frequência:</span>
              <span className="text-white font-bold">{word.freq || 0} ocorrências</span>
            </div>
            <div className="h-1 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
                style={{ width: `${Math.min((word.freq || 0) * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Normalizada */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Normalizada:</span>
            <span className="text-green-400 font-mono">{word.normalized || 0}/1000</span>
          </div>

          {/* Log-Likelihood */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Log-Likelihood:</span>
            <span className="text-purple-400 font-mono">{word.logLikelihood?.toFixed(1) || '0.0'}</span>
          </div>

          {/* MI Score */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">MI Score:</span>
            <span className="text-pink-400 font-mono">{word.miScore?.toFixed(2) || '0.00'}</span>
          </div>

          {/* Association Strength */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Força Assoc.:</span>
            <span className="text-orange-400 font-mono">{word.associationStrength?.toFixed(1) || '0.0'}%</span>
          </div>

          {/* Prosódia */}
          <div className="flex justify-between text-xs items-center">
            <span className="text-cyan-300/80 uppercase tracking-wide">Prosódia:</span>
            <span 
              className="font-bold px-2 py-0.5 rounded text-white"
              style={{ 
                background: getProsodyColor(word.prosody),
                boxShadow: `0 0 8px ${getProsodyColor(word.prosody)}80`
              }}
            >
              {(word.prosody || 'Neutra').toUpperCase()}
            </span>
          </div>

          {/* Sentimento */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Sentimento:</span>
            <span className="text-yellow-400 italic">{word.sentiment || 'Indefinido'}</span>
          </div>
        </div>
      )}

      {/* Stats Grid - Galaxy level */}
      {level === 'galaxy' && (
        <div className="space-y-2.5">
          {/* Riqueza Lexical */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-300/80 uppercase tracking-wide">Riqueza Lexical:</span>
              <span className="text-white font-bold">{word.riquezaLexical || 0} lemas únicos</span>
            </div>
            <div className="h-1 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min((word.riquezaLexical || 0) * 3.5, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Peso Textual */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Peso Textual:</span>
            <span className="text-green-400 font-mono">{word.pesoTextual || 0} ocorrências</span>
          </div>

          {/* Representação Temática */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Representação:</span>
            <span className="text-purple-400 font-mono">{word.percentualTematico?.toFixed(2) || '0.00'}%</span>
          </div>

          {/* Comparação com Corpus */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs items-center">
              <span className="text-cyan-300/80 uppercase tracking-wide">vs. Corpus NE:</span>
              <span 
                className={`font-bold px-2 py-0.5 rounded text-white ${
                  (word.comparacaoCorpus === 'super-representado') ? 'bg-green-600' :
                  (word.comparacaoCorpus === 'sub-representado') ? 'bg-red-600' :
                  'bg-gray-600'
                }`}
              >
                {word.comparacaoCorpus === 'super-representado' ? '⬆️ SUPER' :
                 word.comparacaoCorpus === 'sub-representado' ? '⬇️ SUB' :
                 '➖ EQUILIBRADO'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cyan-300/80 uppercase tracking-wide">Diferença:</span>
              <span className={`font-mono font-bold ${(word.diferencaCorpus || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(word.diferencaCorpus || 0) > 0 ? '+' : ''}{word.diferencaCorpus?.toFixed(2) || '0.00'}pp
              </span>
            </div>
          </div>

          {/* Anéis Orbitais */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300/80 uppercase tracking-wide">Anéis Orbitais:</span>
            <span className="text-yellow-400 font-mono">{word.numRings || 0} anéis</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-cyan-400/20 mt-3 pt-2 text-center">
        <span className="text-[10px] text-cyan-300 tracking-widest animate-pulse">
          ► CLIQUE PARA ANÁLISE DETALHADA ◄
        </span>
      </div>
    </div>
  );
};

/**
 * 🎨 STYLE ANALYSIS TAB
 * 
 * Integra as 7 ferramentas de análise estilística de Leech & Short:
 * - Perfil Léxico
 * - Perfil Sintático
 * - Figuras Retóricas
 * - Coesão
 * - Fala e Pensamento
 * - Mind Style
 * - Foregrounding
 */

import React, { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Palette, 
  Link2, 
  MessageCircle, 
  Brain, 
  Sparkles 
} from 'lucide-react';
import { useAnalysisTools } from '@/contexts/AnalysisToolsContext';
import { CorpusSelector } from './CorpusSelector';
import { AnalysisToolsBridge } from './ContextBridge';

// Ferramentas existentes
import { TabLexicalProfile } from '@/components/advanced/TabLexicalProfile';
import { SyntacticProfileTool } from '@/components/expanded/SyntacticProfileTool';
import { RhetoricalFiguresTool } from '@/components/expanded/RhetoricalFiguresTool';
import { CohesionAnalysisTool } from '@/components/expanded/CohesionAnalysisTool';
import { SpeechThoughtPresentationTool } from '@/components/expanded/SpeechThoughtPresentationTool';
import { MindStyleAnalyzerTool } from '@/components/expanded/MindStyleAnalyzerTool';
import { ForegroundingDetectorTool } from '@/components/expanded/ForegroundingDetectorTool';

const styleTools = [
  { id: 'lexical', label: 'Léxico', icon: BookOpen },
  { id: 'syntactic', label: 'Sintaxe', icon: FileText },
  { id: 'rhetorical', label: 'Retórica', icon: Palette },
  { id: 'cohesion', label: 'Coesão', icon: Link2 },
  { id: 'speech', label: 'Fala', icon: MessageCircle },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'foregrounding', label: 'Desvio', icon: Sparkles },
];

export function StyleAnalysisTab() {
  const { studyCorpus, setStudyCorpus, referenceCorpus, setReferenceCorpus } = useAnalysisTools();
  const [activeToolTab, setActiveToolTab] = useState('lexical');
  const analyzeRef = useRef<(() => void) | null>(null);

  return (
    <div className="space-y-6">
      {/* Seletores de Corpus */}
      <div className="grid md:grid-cols-2 gap-4">
        <CorpusSelector
          label="Corpus de Estudo"
          description="Corpus para análise estilística (preferencialmente anotado)"
          value={studyCorpus}
          onChange={setStudyCorpus}
          showBalancing
        />
        <CorpusSelector
          label="Corpus de Referência"
          description="Corpus para comparação de perfis"
          value={referenceCorpus}
          onChange={setReferenceCorpus}
        />
      </div>

      {/* Ferramentas em Sub-Abas */}
      <AnalysisToolsBridge>
        <Tabs value={activeToolTab} onValueChange={setActiveToolTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
            {styleTools.map(tool => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id} 
                className="flex items-center gap-1.5"
              >
                <tool.icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{tool.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="lexical" className="mt-4">
            <TabLexicalProfile analyzeRef={analyzeRef} />
          </TabsContent>
          
          <TabsContent value="syntactic" className="mt-4">
            <SyntacticProfileTool />
          </TabsContent>
          
          <TabsContent value="rhetorical" className="mt-4">
            <RhetoricalFiguresTool />
          </TabsContent>
          
          <TabsContent value="cohesion" className="mt-4">
            <CohesionAnalysisTool />
          </TabsContent>
          
          <TabsContent value="speech" className="mt-4">
            <SpeechThoughtPresentationTool />
          </TabsContent>
          
          <TabsContent value="mind" className="mt-4">
            <MindStyleAnalyzerTool />
          </TabsContent>
          
          <TabsContent value="foregrounding" className="mt-4">
            <ForegroundingDetectorTool />
          </TabsContent>
        </Tabs>
      </AnalysisToolsBridge>
    </div>
  );
}

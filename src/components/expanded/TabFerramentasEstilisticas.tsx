import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Palette, Link2, FileText } from "lucide-react";
import { SyntacticProfileTool } from "./SyntacticProfileTool";
import { RhetoricalFiguresTool } from "./RhetoricalFiguresTool";
import { CohesionAnalysisTool } from "./CohesionAnalysisTool";
import { TabLexicalProfile } from "@/components/advanced/TabLexicalProfile";

export function TabFerramentasEstilisticas() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Ferramentas Estilísticas
          </CardTitle>
          <CardDescription>
            Análises baseadas em Leech & Short (2007) - Style in Fiction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lexical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="lexical" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil Léxico</span>
              </TabsTrigger>
              <TabsTrigger value="syntactic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil Sintático</span>
              </TabsTrigger>
              <TabsTrigger value="rhetorical" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Figuras Retóricas</span>
              </TabsTrigger>
              <TabsTrigger value="cohesion" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">Coesão</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lexical" className="mt-6">
              <TabLexicalProfile />
            </TabsContent>

            <TabsContent value="syntactic" className="mt-6">
              <SyntacticProfileTool />
            </TabsContent>

            <TabsContent value="rhetorical" className="mt-6">
              <RhetoricalFiguresTool />
            </TabsContent>

            <TabsContent value="cohesion" className="mt-6">
              <CohesionAnalysisTool />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

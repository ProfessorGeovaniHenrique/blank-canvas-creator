import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProcessedSongResultsProps {
  data: {
    semanticDomains: any;
    posStats: any;
    rawText: string;
    metadata: {
      artista: string;
      musica: string;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ProcessedSongResults({ data }: ProcessedSongResultsProps) {
  const domainData = Object.entries(data.semanticDomains.domains || {}).map(([domain, count]: [string, any]) => ({
    name: domain,
    value: count
  })).sort((a, b) => b.value - a.value);

  const posData = Object.entries(data.posStats.distribuicaoPOS || {}).map(([pos, count]: [string, any]) => ({
    name: pos,
    value: count
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultados do Processamento</CardTitle>
          <div className="text-sm text-muted-foreground">
            {data.metadata.artista} - {data.metadata.musica}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="domains" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="domains">Domínios Semânticos</TabsTrigger>
              <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
              <TabsTrigger value="pos">POS Tags</TabsTrigger>
              <TabsTrigger value="text">Texto Anotado</TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4 mt-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {domainData.map((domain, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{domain.name}</span>
                    <Badge variant="secondary">{domain.value}</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{data.posStats.totalTokens}</div>
                    <div className="text-sm text-muted-foreground">Total de Palavras</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{data.posStats.typeTokenRatio.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Type-Token Ratio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{(data.posStats.densidadeLexical * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Densidade Lexical</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pos" className="space-y-4 mt-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={posData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {posData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{data.rawText}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Code2, GitBranch, BookOpen, Award } from "lucide-react";
import { projectStats } from "@/data/developer-logs";

export function ProjectStats() {
  const stats = [
    {
      icon: GitBranch,
      label: "Fases Totais",
      value: projectStats.totalPhases,
      description: `${projectStats.completedPhases} concluídas`,
      color: "text-blue-500"
    },
    {
      icon: Code2,
      label: "Linhas de Código",
      value: projectStats.totalLinesOfCode.toLocaleString(),
      description: `${projectStats.totalArtifacts} artefatos`,
      color: "text-green-500"
    },
    {
      icon: Award,
      label: "Decisões Técnicas",
      value: projectStats.totalDecisions,
      description: "Documentadas",
      color: "text-purple-500"
    },
    {
      icon: BookOpen,
      label: "Referências",
      value: projectStats.totalScientificReferences,
      description: "Científicas",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

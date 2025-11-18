import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { milestones, type Milestone } from "@/data/developer-logs/product-roadmap";

export function RoadmapTimeline() {
  const currentDate = new Date();
  
  const getMilestoneStatus = (milestone: Milestone): 'completed' | 'current' | 'upcoming' => {
    return milestone.status;
  };

  const getProgressWidth = () => {
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    return (completedCount / milestones.length) * 100;
  };

  return (
    <Card className="p-6 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Roadmap Timeline</h3>
        <Badge variant="outline" className="ml-auto">
          {milestones.filter(m => m.status === 'completed').length} / {milestones.length} Marcos
        </Badge>
      </div>

      <div className="relative">
        {/* Timeline bar */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-muted rounded-full transition-all duration-1000"
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="relative flex justify-between pt-2 pb-8">
          {milestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            
            return (
              <HoverCard key={milestone.id}>
                <HoverCardTrigger asChild>
                  <button className="flex flex-col items-center gap-2 group relative">
                    {/* Marker */}
                    <div className={`
                      relative z-10 w-4 h-4 rounded-full border-2 transition-all
                      ${status === 'completed' ? 'bg-green-500 border-green-500 shadow-green-500/50' : ''}
                      ${status === 'current' ? 'bg-yellow-500 border-yellow-500 shadow-yellow-500/50 animate-pulse' : ''}
                      ${status === 'upcoming' ? 'bg-muted border-border' : ''}
                      group-hover:scale-125 shadow-lg
                    `}>
                      {status === 'completed' && (
                        <CheckCircle2 className="absolute inset-0 w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <div className="text-xs font-medium whitespace-nowrap">
                        {milestone.date}
                      </div>
                      {status === 'current' && (
                        <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-2">
                          Você está aqui
                        </Badge>
                      )}
                    </div>
                  </button>
                </HoverCardTrigger>

                <HoverCardContent className="w-80" side="bottom">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">{milestone.title}</h4>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground">
                        {milestone.description}
                      </p>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{milestone.epicIds.length}</span> épicos relacionados
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

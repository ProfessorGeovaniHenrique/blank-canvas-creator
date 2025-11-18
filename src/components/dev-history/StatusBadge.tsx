import { CheckCircle2, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'completed' | 'in-progress' | 'planned';
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const statusConfig = {
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-700 dark:text-green-400',
    iconColor: 'text-green-500'
  },
  'in-progress': {
    label: 'Em Progresso',
    icon: Clock,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    iconColor: 'text-yellow-500'
  },
  planned: {
    label: 'Planejado',
    icon: Circle,
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground'
  }
};

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Icon className={cn("h-5 w-5", config.iconColor, status === 'in-progress' && "animate-pulse")} />
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all",
        config.bgColor,
        config.borderColor,
        config.textColor,
        status === 'in-progress' && "animate-pulse",
        className
      )}>
        <Icon className={cn("h-4 w-4", config.iconColor)} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-md border transition-all",
      config.bgColor,
      config.borderColor,
      config.textColor,
      status === 'in-progress' && "animate-pulse",
      className
    )}>
      <Icon className={cn("h-4 w-4", config.iconColor)} />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}

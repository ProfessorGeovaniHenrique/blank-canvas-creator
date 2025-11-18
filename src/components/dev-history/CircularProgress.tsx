import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { dimension: 60, defaultStroke: 6, fontSize: 'text-xs' },
  md: { dimension: 80, defaultStroke: 8, fontSize: 'text-sm' },
  lg: { dimension: 120, defaultStroke: 10, fontSize: 'text-lg' }
};

export function CircularProgress({ 
  value, 
  size = 'md', 
  strokeWidth,
  showLabel = true,
  label,
  className 
}: CircularProgressProps) {
  const config = sizeConfig[size];
  const dimension = config.dimension;
  const stroke = strokeWidth || config.defaultStroke;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Cor baseada no valor
  const getColor = () => {
    if (value >= 71) return 'hsl(142.1 76.2% 36.3%)'; // success
    if (value >= 31) return 'hsl(47.9 95.8% 53.1%)'; // warning
    return 'hsl(0 84.2% 60.2%)'; // destructive
  };

  const progressColor = getColor();

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", config.fontSize)} style={{ color: progressColor }}>
            {value}%
          </span>
          {label && (
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

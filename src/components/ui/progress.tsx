import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, color = "primary", size = "md", showLabel, animated, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
      primary: "bg-blue-500",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    };

    const glows = {
      primary: "shadow-blue-500/50",
      success: "shadow-emerald-500/50",
      warning: "shadow-amber-500/50",
      danger: "shadow-red-500/50",
    };

    const sizes = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        <div className={cn("w-full rounded-full bg-slate-800 overflow-hidden", sizes[size])}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              colors[color],
              animated && "shadow-md",
              animated && glows[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>{Math.round(percentage)}%</span>
            <span>{value} / {max}</span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };

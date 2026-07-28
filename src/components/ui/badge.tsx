import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-slate-800 text-slate-300 border border-slate-700",
      success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      danger: "bg-red-500/15 text-red-400 border border-red-500/30",
      info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };

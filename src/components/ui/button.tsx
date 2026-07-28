import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 focus-visible:ring-blue-500",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600",
      ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
      danger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50",
      success:
        "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25",
      outline:
        "border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white hover:bg-blue-500/10",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

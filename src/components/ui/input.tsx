import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

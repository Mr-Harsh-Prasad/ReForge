"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white transition-all duration-200",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/60",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

const Switch = ({ checked, onCheckedChange, label, description, id }: SwitchProps) => {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-slate-200 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        id={switchId}
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
          checked ? "bg-blue-600" : "bg-slate-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
};

export { Switch };

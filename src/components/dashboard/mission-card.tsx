"use client";

import { useState } from "react";
import { Check, Clock, SkipForward } from "lucide-react";
import { cn, getDifficultyColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Mission, Goal } from "@prisma/client";

type MissionWithGoal = Mission & { goal: { title: string; color: string } | null };

interface Props {
  mission: MissionWithGoal;
  onUpdate?: () => void;
}

export function MissionCard({ mission, onUpdate }: Props) {
  const [status, setStatus] = useState(mission.status);
  const [loading, setLoading] = useState(false);

  const complete = async () => {
    if (status === "COMPLETED" || loading) return;
    setLoading(true);
    const res = await fetch(`/api/missions/${mission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) {
      setStatus("COMPLETED");
      onUpdate?.();
    }
    setLoading(false);
  };

  const skip = async () => {
    if (status === "SKIPPED" || loading) return;
    setLoading(true);
    const res = await fetch(`/api/missions/${mission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SKIPPED" }),
    });
    if (res.ok) {
      setStatus("SKIPPED");
      onUpdate?.();
    }
    setLoading(false);
  };

  const diffColor = getDifficultyColor(mission.difficulty);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
        status === "COMPLETED"
          ? "border-emerald-500/30 bg-emerald-500/5 opacity-75"
          : status === "SKIPPED"
          ? "border-slate-700/50 bg-slate-800/30 opacity-60"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
      )}
    >
      <button
        onClick={complete}
        disabled={loading || status === "COMPLETED" || status === "SKIPPED"}
        aria-label="Complete mission"
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all",
          status === "COMPLETED"
            ? "border-emerald-500 bg-emerald-500"
            : "border-slate-600 hover:border-emerald-500"
        )}
      >
        {status === "COMPLETED" && <Check className="h-3.5 w-3.5 text-white" />}
        {loading && <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", status === "COMPLETED" ? "line-through text-slate-400" : "text-white")}>
          {mission.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-xs font-medium", diffColor)}>{mission.difficulty}</span>
          <span className="text-xs text-slate-500">+{mission.xpReward} XP</span>
          {mission.goal && (
            <span className="text-xs text-slate-500 truncate">· {mission.goal.title}</span>
          )}
        </div>
      </div>

      {status !== "COMPLETED" && status !== "SKIPPED" && (
        <button
          onClick={skip}
          disabled={loading}
          title="Skip mission"
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

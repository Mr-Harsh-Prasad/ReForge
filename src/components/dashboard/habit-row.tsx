"use client";

import { useState } from "react";
import { Check, SkipForward, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@prisma/client";

type HabitWithCompletion = Habit & { completions: { skipped: boolean }[] };

interface Props {
  habit: HabitWithCompletion;
  onUpdate?: () => void;
}

export function HabitRow({ habit, onUpdate }: Props) {
  const isCompleted = habit.completions.length > 0 && !habit.completions[0].skipped;
  const isSkipped = habit.completions.length > 0 && habit.completions[0].skipped;
  const [done, setDone] = useState(isCompleted);
  const [skipped, setSkipped] = useState(isSkipped);
  const [loading, setLoading] = useState(false);

  const complete = async () => {
    if (done || loading) return;
    setLoading(true);
    const res = await fetch(`/api/habits/${habit.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: false }),
    });
    if (res.ok) { setDone(true); setSkipped(false); onUpdate?.(); }
    setLoading(false);
  };

  const skip = async () => {
    if (skipped || loading) return;
    setLoading(true);
    const res = await fetch(`/api/habits/${habit.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: true }),
    });
    if (res.ok) { setSkipped(true); setDone(false); onUpdate?.(); }
    setLoading(false);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border p-3 transition-all",
      done ? "border-emerald-500/30 bg-emerald-500/5 opacity-75"
        : skipped ? "border-slate-700/50 bg-slate-800/30 opacity-60"
        : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
    )}>
      <button
        onClick={complete}
        disabled={loading || done || skipped}
        aria-label="Complete habit"
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all",
          done ? "border-emerald-500 bg-emerald-500" : "border-slate-600 hover:border-emerald-500"
        )}
        style={{ borderColor: done ? undefined : habit.color }}
      >
        {done && <Check className="h-3.5 w-3.5 text-white" />}
        {loading && <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", done ? "line-through text-slate-400" : "text-white")}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {habit.currentStreak > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Flame className="h-3 w-3" />{habit.currentStreak}d
            </span>
          )}
          <span className="text-xs text-slate-500">+{habit.xpReward} XP</span>
        </div>
      </div>

      {!done && !skipped && (
        <button onClick={skip} disabled={loading} title="Skip" className="text-slate-500 hover:text-slate-300 transition-colors">
          <SkipForward className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

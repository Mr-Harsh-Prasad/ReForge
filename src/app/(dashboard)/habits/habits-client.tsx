"use client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Trash2, Archive, Flame, Check, SkipForward, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { habitSchema, type HabitInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { Habit, HabitCompletion } from "@prisma/client";

type HabitWithData = Habit & {
  completions: Pick<HabitCompletion, "skipped">[];
  _count: { completions: number };
};

const CATEGORIES = ["HEALTH","FITNESS","LEARNING","CAREER","FINANCE","RELATIONSHIPS","MINDFULNESS","CREATIVITY","OTHER"];
const COLORS = ["#2563EB","#22C55E","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#EC4899"];
const PRIORITY_COLORS: Record<string, "info"|"success"|"warning"|"danger"> = {
  LOW: "info", MEDIUM: "success", HIGH: "warning", CRITICAL: "danger",
};

export function HabitsClient({ habits: initial }: { habits: HabitWithData[] }) {
  const [habits, setHabits] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<HabitInput, any, HabitInput>({
      resolver: zodResolver(habitSchema),
      defaultValues: { category: "OTHER", priority: "MEDIUM", frequency: "DAILY", color: "#2563EB", xpReward: 25 },
    });
  const selectedColor = watch("color");

  const addHabit = async (data: HabitInput) => {
    const res = await fetch("/api/habits", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const habit = await res.json();
      setHabits((p) => [{ ...habit, completions: [], _count: { completions: 0 } }, ...p]);
      reset(); setShowForm(false);
    }
  };

  const complete = async (id: string) => {
    setLoading(id);
    const res = await fetch(`/api/habits/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: false }),
    });
    if (res.ok) {
      setHabits((p) => p.map((h) => h.id === id
        ? { ...h, completions: [{ skipped: false }], currentStreak: h.currentStreak + 1 }
        : h
      ));
    }
    setLoading(null);
  };

  const skip = async (id: string) => {
    setLoading(id + "_skip");
    await fetch(`/api/habits/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: true }),
    });
    setHabits((p) => p.map((h) => h.id === id ? { ...h, completions: [{ skipped: true }] } : h));
    setLoading(null);
  };

  const archive = async (id: string) => {
    setLoading(id + "_arch");
    await fetch(`/api/habits/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    setHabits((p) => p.map((h) => h.id === id ? { ...h, isArchived: true } : h));
    setLoading(null);
  };

  const unarchive = async (id: string) => {
    await fetch(`/api/habits/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    setHabits((p) => p.map((h) => h.id === id ? { ...h, isArchived: false } : h));
  };

  const deleteHabit = async (id: string) => {
    setLoading(id + "_del");
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) setHabits((p) => p.filter((h) => h.id !== id));
    setLoading(null);
  };

  const displayed = habits.filter((h) => tab === "active" ? !h.isArchived : h.isArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Habit Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">
            {habits.filter((h) => !h.isArchived && h.completions.length > 0 && !h.completions[0].skipped).length} completed today
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} id="add-habit-btn">
          <Plus className="h-4 w-4" /> Add Habit
        </Button>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <Card>
              <CardHeader><CardTitle>New Habit</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(addHabit)} className="space-y-4">
                  <Input label="Habit name" placeholder="e.g. Drink 2L of water" error={errors.name?.message} {...register("name")} />
                  <Input label="Description (optional)" placeholder="Why do you want this habit?" {...register("description")} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0) + c.slice(1).toLowerCase() }))} {...register("category")} />
                    <Select label="Priority" options={[{value:"LOW",label:"Low"},{value:"MEDIUM",label:"Medium"},{value:"HIGH",label:"High"},{value:"CRITICAL",label:"Critical"}]} {...register("priority")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Frequency" options={[{value:"DAILY",label:"Daily"},{value:"WEEKDAYS",label:"Weekdays"},{value:"WEEKENDS",label:"Weekends"}]} {...register("frequency")} />
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">XP Reward</label>
                      <input type="number" min={5} max={100} className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" {...register("xpReward", { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setValue("color", c)}
                          className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", selectedColor === c ? "border-white scale-110" : "border-transparent")}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" isLoading={isSubmitting} id="submit-habit">Add Habit</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["active","archived"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            )}>{t}</button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayed.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <TrendingUp className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">{tab === "active" ? "No active habits" : "No archived habits"}</p>
            </motion.div>
          )}
          {displayed.map((habit) => {
            const done = habit.completions.length > 0 && !habit.completions[0].skipped;
            const skipped = habit.completions.length > 0 && habit.completions[0].skipped;
            return (
              <motion.div key={habit.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className={cn("flex items-center gap-4 rounded-xl border p-4 transition-all",
                  done ? "border-emerald-500/20 bg-emerald-500/5 opacity-80"
                    : skipped ? "border-slate-700/40 bg-slate-800/20 opacity-60"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                )}>
                {/* Complete Button */}
                <button onClick={() => complete(habit.id)} disabled={done || skipped || !!loading}
                  className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all",
                    done ? "border-emerald-500 bg-emerald-500" : "hover:scale-110"
                  )}
                  style={{ borderColor: done ? undefined : habit.color }}>
                  {loading === habit.id ? <span className="h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                    : done ? <Check className="h-4 w-4 text-white" />
                    : null}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-semibold text-sm", done ? "line-through text-slate-400" : "text-white")}>{habit.name}</p>
                    <Badge variant={PRIORITY_COLORS[habit.priority]} size="sm">{habit.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {habit.currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-400"><Flame className="h-3 w-3" />{habit.currentStreak}d</span>
                    )}
                    <span className="text-xs text-slate-500">+{habit.xpReward} XP · {habit.category}</span>
                    <span className="text-xs text-slate-500">{habit._count.completions} total</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!done && !skipped && !habit.isArchived && (
                    <button onClick={() => skip(habit.id)} title="Skip today" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                      <SkipForward className="h-4 w-4" />
                    </button>
                  )}
                  {!habit.isArchived ? (
                    <button onClick={() => archive(habit.id)} title="Archive" className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                      <Archive className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => unarchive(habit.id)} title="Restore" className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} title="Delete" className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

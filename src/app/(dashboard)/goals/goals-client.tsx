"use client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Trash2, Check, Edit3, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { goalSchema, type GoalInput } from "@/lib/validations";
import { formatDate, cn } from "@/lib/utils";
import type { Goal } from "@prisma/client";

type GoalWithCount = Goal & { _count: { missions: number } };

interface Props { goals: GoalWithCount[] }

const CATEGORIES = ["HEALTH","FITNESS","LEARNING","CAREER","FINANCE","RELATIONSHIPS","MINDFULNESS","CREATIVITY","OTHER"];
const PRIORITIES = ["LOW","MEDIUM","HIGH","CRITICAL"];
const COLORS = ["#2563EB","#22C55E","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#EC4899"];
const STATUS_COLORS: Record<string, "success"|"warning"|"info"|"danger"> = {
  ACTIVE: "info", COMPLETED: "success", PAUSED: "warning", ABANDONED: "danger",
};

export function GoalsClient({ goals: initial }: Props) {
  const [goals, setGoals] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<GoalInput, any, GoalInput>({
      resolver: zodResolver(goalSchema),
      defaultValues: { category: "OTHER", priority: "MEDIUM", color: "#2563EB" },
    });

  const selectedColor = watch("color");

  const addGoal = async (data: GoalInput) => {
    const res = await fetch("/api/goals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const goal = await res.json();
      setGoals((p) => [{ ...goal, _count: { missions: 0 } }, ...p]);
      reset(); setShowForm(false);
    }
  };

  const updateProgress = async (id: string, delta: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const progress = Math.min(100, Math.max(0, goal.progress + delta));
    const status = progress === 100 ? "COMPLETED" : goal.status === "COMPLETED" ? "ACTIVE" : goal.status;
    setGoals((p) => p.map((g) => g.id === id ? { ...g, progress, status } : g));
    await fetch(`/api/goals/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, status }),
    });
  };

  const updateStatus = async (id: string, status: string) => {
    setGoals((p) => p.map((g) => g.id === id ? { ...g, status: status as Goal["status"] } : g));
    await fetch(`/api/goals/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const deleteGoal = async (id: string) => {
    setLoading(id);
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) setGoals((p) => p.filter((g) => g.id !== id));
    setLoading(null);
  };

  const filtered = goals.filter((g) => filterStatus === "ALL" || g.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Goals</h1>
          <p className="text-slate-400 text-sm mt-1">
            {goals.filter((g) => g.status === "ACTIVE").length} active · {goals.filter((g) => g.status === "COMPLETED").length} completed
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} id="add-goal-btn">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <Card>
              <CardHeader><CardTitle>New Goal</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(addGoal)} className="space-y-4">
                  <Input label="Goal title" placeholder="What do you want to achieve?" error={errors.title?.message} {...register("title")} />
                  <Input label="Description" placeholder="Why is this goal important?" {...register("description")} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0) + c.slice(1).toLowerCase() }))} {...register("category")} />
                    <Select label="Priority" options={PRIORITIES.map((p) => ({ value: p, label: p.charAt(0) + p.slice(1).toLowerCase() }))} {...register("priority")} />
                  </div>
                  <Input label="Target date" type="date" {...register("targetDate")} />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setValue("color", c)}
                          className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", selectedColor === c ? "border-white scale-110" : "border-transparent")}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" isLoading={isSubmitting} id="submit-goal">Create Goal</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL","ACTIVE","COMPLETED","PAUSED"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            )}>{s.charAt(0) + s.slice(1).toLowerCase()}</button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16">
              <Target className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No goals yet</p>
              <p className="text-slate-500 text-sm mt-1">Set your first goal to start your journey</p>
            </motion.div>
          )}
          {filtered.map((goal) => (
            <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="card-hover h-full flex flex-col">
                <CardContent className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: goal.color }} />
                      <Badge variant={STATUS_COLORS[goal.status]}>{goal.status}</Badge>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} disabled={loading === goal.id}
                      className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1">{goal.title}</h3>
                  {goal.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{goal.description}</p>}

                  <div className="mt-auto space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-bold text-white">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} color="primary" size="md" animated />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button onClick={() => updateProgress(goal.id, -10)}
                          className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => updateProgress(goal.id, 10)}
                          className="h-7 w-7 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 flex items-center justify-center transition-colors text-blue-400">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {goal.status === "ACTIVE" && (
                          <button onClick={() => updateStatus(goal.id, "COMPLETED")}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors">
                            <Check className="h-3 w-3" /> Done
                          </button>
                        )}
                        {goal.status !== "ACTIVE" && goal.status !== "ABANDONED" && (
                          <button onClick={() => updateStatus(goal.id, "ACTIVE")}
                            className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors">
                            Resume
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{goal.category}</span>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

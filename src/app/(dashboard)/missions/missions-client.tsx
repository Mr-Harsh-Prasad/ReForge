"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckSquare, Filter, Trash2, Edit2, Check, SkipForward } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { missionSchema, type MissionInput } from "@/lib/validations";
import { getDifficultyColor, cn } from "@/lib/utils";
import type { Mission } from "@prisma/client";

type MissionWithGoal = Mission & { goal: { title: string; color: string } | null };

interface Props {
  missions: MissionWithGoal[];
  goals: { id: string; title: string; color: string }[];
}

const difficultyOptions = [
  { value: "EASY", label: "Easy (+50 XP)" },
  { value: "MEDIUM", label: "Medium (+100 XP)" },
  { value: "HARD", label: "Hard (+250 XP)" },
  { value: "EPIC", label: "Epic (+500 XP)" },
];

const filterOptions = [
  { value: "ALL", label: "All Missions" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "SKIPPED", label: "Skipped" },
];

export function MissionsClient({ missions: initial, goals }: Props) {
  const [missions, setMissions] = useState(initial);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MissionInput>({
    resolver: zodResolver(missionSchema),
    defaultValues: { difficulty: "MEDIUM" },
  });

  const addMission = async (data: MissionInput) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const res = await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, dueDate: today.toISOString() }),
    });
    if (res.ok) {
      const mission = await res.json();
      setMissions((prev) => [mission, ...prev]);
      reset();
      setShowForm(false);
    }
  };

  const updateStatus = useCallback(async (id: string, status: string) => {
    setLoading(id);
    const res = await fetch(`/api/missions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    }
    setLoading(null);
  }, []);

  const deleteMission = useCallback(async (id: string) => {
    setLoading(id + "_del");
    const res = await fetch(`/api/missions/${id}`, { method: "DELETE" });
    if (res.ok) setMissions((prev) => prev.filter((m) => m.id !== id));
    setLoading(null);
  }, []);

  const filtered = missions.filter((m) => filter === "ALL" || m.status === filter);
  const completed = missions.filter((m) => m.status === "COMPLETED").length;

  const difficultyVariant = (d: string) => {
    const map: Record<string, "success" | "warning" | "danger" | "purple"> = {
      EASY: "success", MEDIUM: "warning", HARD: "danger", EPIC: "purple",
    };
    return map[d] ?? "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Daily Missions</h1>
          <p className="text-slate-400 text-sm mt-1">{completed} of {missions.length} completed</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} id="add-mission-btn">
          <Plus className="h-4 w-4" />
          Add Mission
        </Button>
      </div>

      {/* Add Mission Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>New Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(addMission)} className="space-y-4">
                  <Input
                    label="Mission title"
                    placeholder="What will you conquer today?"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                  <Input
                    label="Description (optional)"
                    placeholder="Details about this mission"
                    {...register("description")}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Difficulty"
                      options={difficultyOptions}
                      {...register("difficulty")}
                    />
                    <Select
                      label="Linked Goal (optional)"
                      options={[{ value: "", label: "No goal" }, ...goals.map((g) => ({ value: g.id, label: g.title }))]}
                      {...register("goalId")}
                    />
                  </div>
                  <Input label="Due date" type="date" {...register("dueDate")} />
                  <div className="flex gap-3">
                    <Button type="submit" isLoading={isSubmitting} id="submit-mission">Add Mission</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <CheckSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No missions found</p>
              <p className="text-slate-500 text-sm mt-1">Add a mission to get started</p>
            </motion.div>
          )}
          {filtered.map((mission) => (
            <motion.div
              key={mission.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-all",
                mission.status === "COMPLETED"
                  ? "border-emerald-500/20 bg-emerald-500/5 opacity-80"
                  : mission.status === "SKIPPED"
                  ? "border-slate-700/40 bg-slate-800/20 opacity-60"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              )}
            >
              <button
                onClick={() => updateStatus(mission.id, "COMPLETED")}
                disabled={mission.status === "COMPLETED" || mission.status === "SKIPPED" || loading === mission.id}
                aria-label="Complete"
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                  mission.status === "COMPLETED"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-600 hover:border-emerald-500"
                )}
              >
                {mission.status === "COMPLETED" && <Check className="h-4 w-4 text-white" />}
                {loading === mission.id && <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm", mission.status === "COMPLETED" ? "line-through text-slate-400" : "text-white")}>
                  {mission.title}
                </p>
                {mission.description && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{mission.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={difficultyVariant(mission.difficulty) as "success"} size="sm">
                    {mission.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-500">+{mission.xpReward} XP</span>
                  {mission.goal && (
                    <span className="text-xs text-slate-500">· {mission.goal.title}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {mission.status === "PENDING" && (
                  <button
                    onClick={() => updateStatus(mission.id, "SKIPPED")}
                    title="Skip"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteMission(mission.id)}
                  disabled={loading === mission.id + "_del"}
                  title="Delete"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  {loading === mission.id + "_del"
                    ? <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin block" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

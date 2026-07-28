"use client";

import { motion } from "framer-motion";
import { Trophy, Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, cn } from "@/lib/utils";
import type { Achievement } from "@prisma/client";

type AchievementWithStatus = Achievement & { unlocked: boolean; unlockedAt: Date | null };

interface Props {
  achievements: AchievementWithStatus[];
  total: number;
  unlocked: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: "border-slate-600 bg-slate-800/60",
  uncommon: "border-emerald-500/40 bg-emerald-500/5",
  rare: "border-blue-500/40 bg-blue-500/5",
  legendary: "border-amber-500/40 bg-amber-500/5",
};

const RARITY_BADGE: Record<string, "default" | "success" | "info" | "warning"> = {
  common: "default", uncommon: "success", rare: "info", legendary: "warning",
};

const TYPE_ICONS: Record<string, string> = {
  STREAK: "🔥", MISSIONS: "✅", HABITS: "🔄", GOALS: "🎯", XP: "⚡", JOURNAL: "📖", SPECIAL: "⭐",
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };

export function AchievementsClient({ achievements, total, unlocked }: Props) {
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Achievements</h1>
          <p className="text-slate-400 text-sm mt-1">{unlocked} of {total} unlocked</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-white">{percent}%</span>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Overall Completion</span>
            <span className="text-sm font-bold text-white">{unlocked}/{total}</span>
          </div>
          <Progress value={percent} color="warning" size="lg" animated />
        </CardContent>
      </Card>

      {/* Recently Unlocked */}
      {achievements.filter((a) => a.unlocked).length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Recently Unlocked</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.filter((a) => a.unlocked).slice(0, 6).map((a) => (
              <div key={a.id} className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 w-24 text-center">
                <span className="text-2xl">{TYPE_ICONS[a.type]}</span>
                <p className="text-xs font-medium text-white leading-tight">{a.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <motion.div key={a.id} variants={item}>
            <div className={cn(
              "rounded-2xl border p-4 h-full transition-all duration-200",
              a.unlocked ? RARITY_COLORS[a.rarity] : "border-slate-800 bg-slate-900/40 opacity-60",
              a.unlocked && "hover:-translate-y-0.5 hover:shadow-lg"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "text-2xl h-11 w-11 rounded-xl flex items-center justify-center",
                    a.unlocked ? "bg-slate-800" : "bg-slate-800/40"
                  )}>
                    {a.unlocked ? TYPE_ICONS[a.type] : <Lock className="h-4 w-4 text-slate-600" />}
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", a.unlocked ? "text-white" : "text-slate-500")}>{a.name}</p>
                    <Badge variant={RARITY_BADGE[a.rarity]} size="sm">{a.rarity}</Badge>
                  </div>
                </div>
              </div>

              <p className={cn("text-xs leading-relaxed", a.unlocked ? "text-slate-300" : "text-slate-600")}>
                {a.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className={cn("flex items-center gap-1 text-xs font-medium", a.unlocked ? "text-amber-400" : "text-slate-600")}>
                  <Zap className="h-3 w-3" />+{a.xpReward} XP
                </span>
                {a.unlocked && a.unlockedAt ? (
                  <span className="text-xs text-slate-500">{formatDate(a.unlockedAt)}</span>
                ) : (
                  <span className="text-xs text-slate-600">Locked</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

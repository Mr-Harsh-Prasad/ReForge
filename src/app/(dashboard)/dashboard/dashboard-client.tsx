"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target, CheckSquare, TrendingUp, Bell, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { MissionCard } from "@/components/dashboard/mission-card";
import { HabitRow } from "@/components/dashboard/habit-row";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { formatRelativeTime, getDifficultyColor } from "@/lib/utils";
import type { Mission, Goal, Habit, Notification, MissionLog } from "@prisma/client";

type DashboardMission = Mission & { goal: { title: string; color: string } | null };
type DashboardHabit = Habit & { completions: { skipped: boolean }[] };

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
  streak: { current: number; longest: number };
  xp: { total: number; level: number; progress: number };
  today: {
    missions: DashboardMission[];
    habits: DashboardHabit[];
    completionPercent: number;
    dailyScore: number;
    missionsCompleted: number;
    habitsCompleted: number;
  };
  goals: Goal[];
  recentActivity: (MissionLog & { mission: { title: string } })[];
  notifications: Notification[];
  weeklyData: { day: string; xp: number; missions: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function DashboardClient({
  user, streak, xp, today, goals, recentActivity, notifications, weeklyData,
}: Props) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="text-gradient">{user.name?.split(" ")[0] ?? "Champion"}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-400" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </div>
          )}
          <Avatar src={user.image} name={user.name} size="md" />
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Current Streak"
          value={`${streak.current}d`}
          icon={<Flame className="h-5 w-5 text-amber-400" />}
          color="amber"
          sub={`Best: ${streak.longest}d`}
        />
        <StatCard
          label="Total XP"
          value={xp.total.toLocaleString()}
          icon={<Zap className="h-5 w-5 text-blue-400" />}
          color="blue"
          sub={`Level ${xp.level}`}
        />
        <StatCard
          label="Today's Score"
          value={`${today.dailyScore}%`}
          icon={<Star className="h-5 w-5 text-emerald-400" />}
          color="emerald"
          sub={`${today.completionPercent}% complete`}
        />
        <StatCard
          label="Active Goals"
          value={goals.filter((g) => g.status === "ACTIVE").length}
          icon={<Target className="h-5 w-5 text-purple-400" />}
          color="purple"
          sub={`${goals.filter((g) => g.status === "COMPLETED").length} completed`}
        />
      </motion.div>

      {/* XP Level Bar */}
      <motion.div variants={item}>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <span className="text-xs font-black text-white">{xp.level}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Level {xp.level}</p>
                  <p className="text-xs text-slate-400">{xp.total.toLocaleString()} XP total</p>
                </div>
              </div>
              <Badge variant="info">{xp.progress}% to Level {xp.level + 1}</Badge>
            </div>
            <Progress value={xp.progress} color="primary" size="md" animated />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Missions */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-400" />
                  Today&apos;s Missions
                </CardTitle>
                <Badge variant={today.missionsCompleted === today.missions.length && today.missions.length > 0 ? "success" : "default"}>
                  {today.missionsCompleted}/{today.missions.length}
                </Badge>
              </CardHeader>
              <CardContent>
                {today.missions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No missions for today</p>
                    <a href="/missions" className="text-blue-400 text-sm hover:underline mt-1 inline-block">Add a mission →</a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {today.missions.map((m) => (
                      <MissionCard key={m.id} mission={m} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Habits */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Today&apos;s Habits
                </CardTitle>
                <Badge variant={today.habitsCompleted === today.habits.length && today.habits.length > 0 ? "success" : "default"}>
                  {today.habitsCompleted}/{today.habits.length}
                </Badge>
              </CardHeader>
              <CardContent>
                {today.habits.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No habits tracked yet</p>
                    <a href="/missions" className="text-blue-400 text-sm hover:underline mt-1 inline-block">Add a habit →</a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {today.habits.map((h) => (
                      <HabitRow key={h.id} habit={h} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div variants={item}>
            <WeeklyChart data={weeklyData} />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Score Ring */}
          <motion.div variants={item}>
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Daily Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto h-28 w-28 mb-4">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={today.completionPercent >= 80 ? "#22c55e" : today.completionPercent >= 50 ? "#3b82f6" : "#f59e0b"}
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - today.completionPercent / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{today.completionPercent}%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  {completedToday(today)} of {totalToday(today)} tasks done
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  Active Goals
                </CardTitle>
                <a href="/goals" className="text-xs text-blue-400 hover:underline">See all</a>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.filter((g) => g.status === "ACTIVE").slice(0, 4).map((goal) => (
                    <div key={goal.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-slate-300 truncate">{goal.title}</span>
                        <span className="text-xs text-slate-400">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} color="primary" size="sm" />
                    </div>
                  ))}
                  {goals.filter((g) => g.status === "ACTIVE").length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-2">No active goals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-2">No activity yet</p>
                  )}
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{log.mission.title}</p>
                        <p className="text-xs text-slate-500">{formatRelativeTime(log.date)} · +{log.xpEarned} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function completedToday(today: Props["today"]) {
  return today.missionsCompleted + today.habitsCompleted;
}

function totalToday(today: Props["today"]) {
  return today.missions.length + today.habits.length;
}

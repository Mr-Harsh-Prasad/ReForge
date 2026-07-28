"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, TrendingUp, Target, Brain, Star } from "lucide-react";

interface Props {
  timeline: { date: string; xp: number; missions: number; habits: number }[];
  habitStats: { name: string; completions: number; streak: number; total: number }[];
  heatmap: { date: string; count: number }[];
  dayStats: { name: string; missions: number; habits: number }[];
  goalStats: { total: number; active: number; completed: number; categories: { name: string; value: number }[] };
  insights: {
    totalXp: number; currentStreak: number; longestStreak: number; level: number;
    mostConsistentHabit: string; weakestHabit: string; mostProductiveDay: string; avgDailyMissions: string;
  };
}

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function AnalyticsClient({ timeline, habitStats, dayStats, goalStats, insights }: Props) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Your performance over the last 30 days</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Current Streak", value: `${insights.currentStreak}d`, icon: <Flame className="h-4 w-4 text-amber-400" />, color: "text-amber-400" },
          { label: "Best Streak", value: `${insights.longestStreak}d`, icon: <Star className="h-4 w-4 text-yellow-400" />, color: "text-yellow-400" },
          { label: "Total XP", value: insights.totalXp.toLocaleString(), icon: <Zap className="h-4 w-4 text-blue-400" />, color: "text-blue-400" },
          { label: "Level", value: insights.level, icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-2">{stat.icon}</div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* XP Timeline */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-400" />30-Day XP Timeline</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="xp" name="XP" stroke="#3b82f6" strokeWidth={2} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Missions & Habits chart */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Daily Activity (30d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                <Bar dataKey="missions" name="Missions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="habits" name="Habits" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Best Day of Week</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayStats} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                <Bar dataKey="missions" name="Missions" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="habits" name="Habits" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Habit Performance */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Habit Performance</CardTitle></CardHeader>
          <CardContent>
            {habitStats.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No habit data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={habitStats} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                  <Bar dataKey="completions" name="Completions" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Goal Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-purple-400" />Goals by Category</CardTitle></CardHeader>
          <CardContent>
            {goalStats.categories.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No goals yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={goalStats.categories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                    {goalStats.categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4 text-purple-400" />Key Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Most Consistent Habit", value: insights.mostConsistentHabit, variant: "success" as const },
                { label: "Needs Attention", value: insights.weakestHabit, variant: "warning" as const },
                { label: "Most Productive Day", value: insights.mostProductiveDay, variant: "info" as const },
                { label: "Avg Daily Missions", value: insights.avgDailyMissions, variant: "default" as const },
              ].map((ins) => (
                <div key={ins.label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400 mb-2">{ins.label}</p>
                  <Badge variant={ins.variant}>{ins.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

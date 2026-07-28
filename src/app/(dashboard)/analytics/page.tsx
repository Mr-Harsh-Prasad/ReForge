import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [missionLogs, habitCompletions, streak, habits, goals] = await Promise.all([
    prisma.missionLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "asc" } }),
    prisma.habitCompletion.findMany({ where: { userId, date: { gte: thirtyDaysAgo }, skipped: false }, include: { habit: { select: { name: true } } }, orderBy: { date: "asc" } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.habit.findMany({ where: { userId, isArchived: false }, orderBy: { totalCompletions: "desc" } }),
    prisma.goal.findMany({ where: { userId } }),
  ]);

  // Build 30-day timeline
  const timeline = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const dayMissions = missionLogs.filter((l) => new Date(l.date).toISOString().split("T")[0] === key);
    const dayHabits = habitCompletions.filter((c) => new Date(c.date).toISOString().split("T")[0] === key);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      xp: dayMissions.reduce((a, l) => a + l.xpEarned, 0) + dayHabits.reduce((a, c) => a + c.xpEarned, 0),
      missions: dayMissions.length,
      habits: dayHabits.length,
    };
  });

  // Habit breakdown
  const habitStats = habits.slice(0, 8).map((h) => ({
    name: h.name.length > 15 ? h.name.slice(0, 14) + "…" : h.name,
    completions: habitCompletions.filter((c) => c.habitId === h.id).length,
    streak: h.currentStreak,
    total: h.totalCompletions,
  }));

  // Heatmap
  const heatmap: Record<string, number> = {};
  for (const c of habitCompletions) {
    const key = new Date(c.date).toISOString().split("T")[0];
    heatmap[key] = (heatmap[key] ?? 0) + 1;
  }
  for (const l of missionLogs) {
    const key = new Date(l.date).toISOString().split("T")[0];
    heatmap[key] = (heatmap[key] ?? 0) + 1;
  }

  // Day of week stats
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dayStats = dayNames.map((name, idx) => ({
    name,
    missions: missionLogs.filter((l) => new Date(l.date).getDay() === idx).length,
    habits: habitCompletions.filter((c) => new Date(c.date).getDay() === idx).length,
  }));

  const goalStats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "ACTIVE").length,
    completed: goals.filter((g) => g.status === "COMPLETED").length,
    categories: Object.entries(
      goals.reduce((acc, g) => { acc[g.category] = (acc[g.category] ?? 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })),
  };

  const mostProductiveDay = dayStats.reduce((a, b) => (a.missions + a.habits) > (b.missions + b.habits) ? a : b);

  return (
    <AnalyticsClient
      timeline={timeline}
      habitStats={habitStats}
      heatmap={Object.entries(heatmap).map(([date, count]) => ({ date, count }))}
      dayStats={dayStats}
      goalStats={goalStats}
      insights={{
        totalXp: streak?.totalXp ?? 0,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        level: streak?.level ?? 1,
        mostConsistentHabit: habitStats[0]?.name ?? "N/A",
        weakestHabit: habitStats[habitStats.length - 1]?.name ?? "N/A",
        mostProductiveDay: mostProductiveDay.name,
        avgDailyMissions: timeline.length > 0 ? (timeline.reduce((a, d) => a + d.missions, 0) / 30).toFixed(1) : "0",
      }}
    />
  );
}

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";
import { calculateLevel, xpForLevel } from "@/lib/achievements";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const [streak, todayMissions, todayHabits, goals, recentLogs, notifications, weeklyLogs] =
    await Promise.all([
      prisma.streak.findUnique({ where: { userId } }),
      prisma.mission.findMany({
        where: { userId, dueDate: { gte: today, lte: todayEnd } },
        include: { goal: { select: { title: true, color: true } } },
        orderBy: { order: "asc" },
      }),
      prisma.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          completions: { where: { date: { gte: today, lte: todayEnd } }, take: 1 },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        take: 6,
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: [{ status: "asc" }, { priority: "desc" }],
        take: 5,
      }),
      prisma.missionLog.findMany({
        where: { userId },
        include: { mission: { select: { title: true } } },
        orderBy: { date: "desc" },
        take: 6,
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.missionLog.findMany({
        where: { userId, date: { gte: weekAgo } },
        orderBy: { date: "asc" },
      }),
    ]);

  const level = calculateLevel(streak?.totalXp ?? 0);
  const xpProgress = Math.round(
    ((streak?.totalXp ?? 0) - xpForLevel(level)) /
    (xpForLevel(level + 1) - xpForLevel(level)) * 100
  );

  const todayMissionsCompleted = todayMissions.filter((m) => m.status === "COMPLETED").length;
  const todayHabitsCompleted = todayHabits.filter(
    (h) => h.completions.length > 0 && !h.completions[0].skipped
  ).length;
  const totalToday = todayMissions.length + todayHabits.length;
  const completedToday = todayMissionsCompleted + todayHabitsCompleted;
  const completionPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const dailyScore = Math.round(completionPercent * 0.7 + (streak?.currentStreak ?? 0) * 0.3);

  // Weekly chart data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekAgo);
    d.setDate(weekAgo.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const dayLogs = weeklyLogs.filter(
      (l) => new Date(l.date).toISOString().split("T")[0] === key
    );
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      xp: dayLogs.reduce((a, l) => a + l.xpEarned, 0),
      missions: dayLogs.length,
    };
  });

  return (
    <DashboardClient
      user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
      streak={{ current: streak?.currentStreak ?? 0, longest: streak?.longestStreak ?? 0 }}
      xp={{ total: streak?.totalXp ?? 0, level, progress: xpProgress }}
      today={{
        missions: todayMissions,
        habits: todayHabits,
        completionPercent,
        dailyScore,
        missionsCompleted: todayMissionsCompleted,
        habitsCompleted: todayHabitsCompleted,
      }}
      goals={goals}
      recentActivity={recentLogs}
      notifications={notifications}
      weeklyData={weeklyData}
    />
  );
}

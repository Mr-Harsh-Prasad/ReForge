import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorized, withErrorHandler } from "@/lib/api";

export async function GET(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "week"; // week | month | year

    const now = new Date();
    let startDate: Date;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
    } else {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 364);
    }
    startDate.setHours(0, 0, 0, 0);

    const [missionLogs, habitCompletions, streak, habits, goals] = await Promise.all([
      prisma.missionLog.findMany({
        where: { userId, date: { gte: startDate } },
        orderBy: { date: "asc" },
      }),
      prisma.habitCompletion.findMany({
        where: { userId, date: { gte: startDate }, skipped: false },
        include: { habit: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          completions: {
            where: { date: { gte: startDate } },
            orderBy: { date: "asc" },
          },
        },
        orderBy: { totalCompletions: "desc" },
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Build daily timeline
    const days: Record<string, { date: string; xp: number; missions: number; habits: number }> = {};
    const dayCount = period === "week" ? 7 : period === "month" ? 30 : 52;

    for (let i = 0; i < (period === "year" ? 52 : dayCount); i++) {
      const d = new Date(startDate);
      if (period === "year") {
        d.setDate(startDate.getDate() + i * 7);
      } else {
        d.setDate(startDate.getDate() + i);
      }
      const key = d.toISOString().split("T")[0];
      days[key] = { date: key, xp: 0, missions: 0, habits: 0 };
    }

    for (const log of missionLogs) {
      const key = new Date(log.date).toISOString().split("T")[0];
      if (days[key]) {
        days[key].xp += log.xpEarned;
        days[key].missions += 1;
      }
    }

    for (const comp of habitCompletions) {
      const key = new Date(comp.date).toISOString().split("T")[0];
      if (days[key]) {
        days[key].xp += comp.xpEarned;
        days[key].habits += 1;
      }
    }

    // Habit performance
    const habitStats = habits.map((h) => ({
      name: h.name,
      completions: h.completions.length,
      streak: h.currentStreak,
      longestStreak: h.longestStreak,
      total: h.totalCompletions,
    }));

    // Heatmap data (last 365 days)
    const heatmapData: Record<string, number> = {};
    for (const comp of habitCompletions) {
      const key = new Date(comp.date).toISOString().split("T")[0];
      heatmapData[key] = (heatmapData[key] ?? 0) + 1;
    }
    for (const log of missionLogs) {
      const key = new Date(log.date).toISOString().split("T")[0];
      heatmapData[key] = (heatmapData[key] ?? 0) + 1;
    }

    const goalStats = {
      total: goals.length,
      active: goals.filter((g) => g.status === "ACTIVE").length,
      completed: goals.filter((g) => g.status === "COMPLETED").length,
      byCategory: goals.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const mostConsistent = habitStats.sort((a, b) => b.completions - a.completions)[0];
    const weakest = [...habitStats].sort((a, b) => a.completions - b.completions)[0];

    return apiSuccess({
      timeline: Object.values(days),
      habitStats,
      heatmap: Object.entries(heatmapData).map(([date, count]) => ({ date, count })),
      goalStats,
      streak: {
        current: streak?.currentStreak ?? 0,
        longest: streak?.longestStreak ?? 0,
        totalXp: streak?.totalXp ?? 0,
        level: streak?.level ?? 1,
      },
      insights: {
        mostConsistentHabit: mostConsistent?.name ?? null,
        weakestHabit: weakest?.name ?? null,
        totalXpPeriod: Object.values(days).reduce((a, d) => a + d.xp, 0),
        avgDailyCompletion: habits.length > 0
          ? Math.round(
              (habitCompletions.length / (habits.length * dayCount)) * 100
            )
          : 0,
      },
    });
  });
}

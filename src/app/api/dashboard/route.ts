import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorized, withErrorHandler } from "@/lib/api";
import { calculateLevel, xpForLevel } from "@/lib/achievements";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [streak, todayMissions, allMissions, todayHabits, allHabits, goals, recentActivity, notifications] =
      await Promise.all([
        prisma.streak.findUnique({ where: { userId } }),
        prisma.mission.findMany({
          where: { userId, dueDate: { gte: today, lte: todayEnd } },
          include: { goal: { select: { title: true, color: true } } },
          orderBy: { order: "asc" },
        }),
        prisma.mission.findMany({
          where: { userId },
          select: { status: true },
        }),
        prisma.habit.findMany({
          where: { userId, isArchived: false },
          include: {
            completions: {
              where: { date: { gte: today, lte: todayEnd } },
              take: 1,
            },
          },
        }),
        prisma.habit.findMany({
          where: { userId, isArchived: false },
          select: { totalCompletions: true, currentStreak: true },
        }),
        prisma.goal.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.missionLog.findMany({
          where: { userId },
          include: { mission: { select: { title: true } } },
          orderBy: { date: "desc" },
          take: 8,
        }),
        prisma.notification.findMany({
          where: { userId, isRead: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const level = calculateLevel(streak?.totalXp ?? 0);
    const xpForCurrentLevel = xpForLevel(level);
    const xpForNextLevel = xpForLevel(level + 1);
    const xpInLevel = (streak?.totalXp ?? 0) - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = Math.round((xpInLevel / xpNeeded) * 100);

    const todayMissionsCompleted = todayMissions.filter((m) => m.status === "COMPLETED").length;
    const todayHabitsCompleted = todayHabits.filter((h) => h.completions.length > 0 && !h.completions[0].skipped).length;
    const totalItems = todayMissions.length + todayHabits.length;
    const completedItems = todayMissionsCompleted + todayHabitsCompleted;
    const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const dailyScore = Math.round(completionPercent * 0.7 + (streak?.currentStreak ?? 0) * 0.3);

    const allMissionsCompleted = allMissions.filter((m) => m.status === "COMPLETED").length;
    const goalsCompleted = goals.filter((g) => g.status === "COMPLETED").length;

    return apiSuccess({
      streak: {
        current: streak?.currentStreak ?? 0,
        longest: streak?.longestStreak ?? 0,
        lastActive: streak?.lastActiveDate,
      },
      xp: {
        total: streak?.totalXp ?? 0,
        level,
        progress: xpProgress,
        xpInLevel,
        xpNeeded,
      },
      today: {
        missions: { total: todayMissions.length, completed: todayMissionsCompleted, items: todayMissions },
        habits: { total: todayHabits.length, completed: todayHabitsCompleted, items: todayHabits },
        completionPercent,
        dailyScore,
      },
      totals: {
        missionsCompleted: allMissionsCompleted,
        habitsCompleted: allHabits.reduce((a, h) => a + h.totalCompletions, 0),
        goalsActive: goals.filter((g) => g.status === "ACTIVE").length,
        goalsCompleted,
      },
      goals: goals.slice(0, 5),
      recentActivity,
      notifications,
    });
  });
}

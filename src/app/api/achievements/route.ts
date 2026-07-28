import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorized, withErrorHandler } from "@/lib/api";
import { seedAchievements } from "@/lib/achievements";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    await seedAchievements();

    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({ orderBy: [{ type: "asc" }, { threshold: "asc" }] }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      }),
    ]);

    const unlockedIds = new Set(userAchievements.map((u) => u.achievementId));

    const enriched = allAchievements.map((ach) => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
      unlockedAt: userAchievements.find((u) => u.achievementId === ach.id)?.unlockedAt ?? null,
    }));

    return apiSuccess({
      achievements: enriched,
      total: allAchievements.length,
      unlocked: userAchievements.length,
    });
  });
}

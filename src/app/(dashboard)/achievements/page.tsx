import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seedAchievements, checkAndUnlockAchievements } from "@/lib/achievements";
import { AchievementsClient } from "./achievements-client";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  await seedAchievements();
  await checkAndUnlockAchievements(session.user.id);

  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ type: "asc" }, { threshold: "asc" }] }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      orderBy: { unlockedAt: "desc" },
    }),
  ]);

  const unlockedIds = new Set(userAchievements.map((u) => u.achievementId));
  const enriched = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlockedAt: userAchievements.find((u) => u.achievementId === a.id)?.unlockedAt ?? null,
  }));

  return <AchievementsClient achievements={enriched} total={allAchievements.length} unlocked={userAchievements.length} />;
}

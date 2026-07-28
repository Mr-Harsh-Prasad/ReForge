import { prisma } from "@/lib/prisma";

const ACHIEVEMENTS = [
  { name: "First Step", description: "Complete your first habit", icon: "footprints", type: "HABITS" as const, threshold: 1, xpReward: 100, rarity: "common" },
  { name: "Getting Started", description: "Complete your first mission", icon: "check-circle", type: "MISSIONS" as const, threshold: 1, xpReward: 100, rarity: "common" },
  { name: "3-Day Streak", description: "Maintain a 3-day streak", icon: "flame", type: "STREAK" as const, threshold: 3, xpReward: 250, rarity: "common" },
  { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "zap", type: "STREAK" as const, threshold: 7, xpReward: 500, rarity: "uncommon" },
  { name: "Monthly Master", description: "Maintain a 30-day streak", icon: "award", type: "STREAK" as const, threshold: 30, xpReward: 1500, rarity: "rare" },
  { name: "Century Club", description: "Maintain a 100-day streak", icon: "trophy", type: "STREAK" as const, threshold: 100, xpReward: 5000, rarity: "legendary" },
  { name: "Habit Hundred", description: "Complete 100 total habits", icon: "repeat", type: "HABITS" as const, threshold: 100, xpReward: 1000, rarity: "uncommon" },
  { name: "Habit Machine", description: "Complete 500 total habits", icon: "cpu", type: "HABITS" as const, threshold: 500, xpReward: 3000, rarity: "rare" },
  { name: "XP Initiate", description: "Earn 500 total XP", icon: "star", type: "XP" as const, threshold: 500, xpReward: 200, rarity: "common" },
  { name: "XP Hunter", description: "Earn 1,000 total XP", icon: "sparkles", type: "XP" as const, threshold: 1000, xpReward: 400, rarity: "uncommon" },
  { name: "XP Legend", description: "Earn 5,000 total XP", icon: "crown", type: "XP" as const, threshold: 5000, xpReward: 1000, rarity: "rare" },
  { name: "Goal Crusher", description: "Complete your first goal", icon: "target", type: "GOALS" as const, threshold: 1, xpReward: 500, rarity: "uncommon" },
  { name: "Consistency Master", description: "Complete 50 missions", icon: "shield", type: "MISSIONS" as const, threshold: 50, xpReward: 1000, rarity: "rare" },
  { name: "Journal Keeper", description: "Write your first journal entry", icon: "book-open", type: "JOURNAL" as const, threshold: 1, xpReward: 150, rarity: "common" },
  { name: "Reflective Mind", description: "Write 30 journal entries", icon: "brain", type: "JOURNAL" as const, threshold: 30, xpReward: 750, rarity: "uncommon" },
];

export async function seedAchievements() {
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: `seed_${ach.type}_${ach.threshold}` },
      create: { id: `seed_${ach.type}_${ach.threshold}`, ...ach },
      update: {},
    });
  }
}

export async function checkAndUnlockAchievements(userId: string) {
  const [streak, missions, habits, journals, goals] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.missionLog.count({ where: { userId } }),
    prisma.habitCompletion.count({ where: { userId, skipped: false } }),
    prisma.journal.count({ where: { userId } }),
    prisma.goal.count({ where: { userId, status: "COMPLETED" } }),
  ]);

  const allAchievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(userAchievements.map((u) => u.achievementId));

  const unlocked: string[] = [];

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let met = false;
    switch (ach.type) {
      case "STREAK":
        met = (streak?.currentStreak ?? 0) >= ach.threshold;
        break;
      case "MISSIONS":
        met = missions >= ach.threshold;
        break;
      case "HABITS":
        met = habits >= ach.threshold;
        break;
      case "XP":
        met = (streak?.totalXp ?? 0) >= ach.threshold;
        break;
      case "GOALS":
        met = goals >= ach.threshold;
        break;
      case "JOURNAL":
        met = journals >= ach.threshold;
        break;
    }

    if (met) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      // Award XP for achievement
      await prisma.streak.upsert({
        where: { userId },
        create: { userId, totalXp: ach.xpReward },
        update: { totalXp: { increment: ach.xpReward } },
      });
      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          type: "ACHIEVEMENT",
          title: `Achievement Unlocked: ${ach.name}`,
          message: ach.description,
          metadata: { achievementId: ach.id, icon: ach.icon },
        },
      });
      unlocked.push(ach.name);
    }
  }

  return unlocked;
}

export function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}

export function xpProgressInLevel(xp: number) {
  const level = calculateLevel(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return Math.round(((xp - current) / (next - current)) * 100);
}

export async function updateStreak(userId: string, xpEarned: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({ where: { userId } });

  let currentStreak = streak?.currentStreak ?? 0;
  const lastActive = streak?.lastActiveDate;

  if (lastActive) {
    const lastDate = new Date(lastActive);
    lastDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
    if (diff === 0) {
      // Same day — streak unchanged
    } else if (diff === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  } else {
    currentStreak = 1;
  }

  const newTotalXp = (streak?.totalXp ?? 0) + xpEarned;
  const newLevel = calculateLevel(newTotalXp);
  const oldLevel = calculateLevel((streak?.totalXp ?? 0));
  const longestStreak = Math.max(streak?.longestStreak ?? 0, currentStreak);

  const updated = await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak,
      longestStreak,
      lastActiveDate: new Date(),
      totalXp: xpEarned,
      level: newLevel,
    },
    update: {
      currentStreak,
      longestStreak,
      lastActiveDate: new Date(),
      totalXp: { increment: xpEarned },
      level: newLevel,
    },
  });

  if (newLevel > oldLevel) {
    await prisma.notification.create({
      data: {
        userId,
        type: "LEVEL_UP",
        title: `Level Up! You're now Level ${newLevel}`,
        message: `You've reached Level ${newLevel}. Keep going!`,
        metadata: { level: newLevel },
      },
    });
  }

  return updated;
}

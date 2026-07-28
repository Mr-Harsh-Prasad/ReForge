import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { habitSchema } from "@/lib/validations";
import { updateStreak, checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, notFound, badRequest, withErrorHandler } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const body = await req.json();
    const parsed = habitSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
    if (!habit) return notFound("Habit");

    const updated = await prisma.habit.update({
      where: { id },
      data: { ...parsed.data },
    });

    return apiSuccess(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const deleted = await prisma.habit.deleteMany({ where: { id, userId: session.user.id } });
    if (deleted.count === 0) return notFound("Habit");

    return apiSuccess({ message: "Habit deleted" });
  });
}

// POST /api/habits/[id]/complete
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const body = await req.json();
    const { skipped, notes } = body as { skipped?: boolean; notes?: string };

    const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
    if (!habit) return notFound("Habit");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completion = await prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId: id, date: today } },
      create: {
        userId: session.user.id,
        habitId: id,
        date: today,
        skipped: skipped ?? false,
        notes,
        xpEarned: skipped ? 0 : habit.xpReward,
      },
      update: {
        skipped: skipped ?? false,
        notes,
        xpEarned: skipped ? 0 : habit.xpReward,
      },
    });

    if (!skipped) {
      // Recalculate habit streak
      const completions = await prisma.habitCompletion.findMany({
        where: { habitId: id, skipped: false },
        orderBy: { date: "desc" },
        take: 200,
      });

      let currentStreak = 0;
      let longestStreak = habit.longestStreak;
      const sorted = completions.map((c) => new Date(c.date).getTime()).sort((a, b) => b - a);
      const todayMs = today.getTime();

      for (let i = 0; i < sorted.length; i++) {
        const expected = todayMs - i * 86400000;
        if (sorted[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      await prisma.habit.update({
        where: { id },
        data: {
          currentStreak,
          longestStreak,
          totalCompletions: { increment: 1 },
        },
      });

      await updateStreak(session.user.id, habit.xpReward);
      await checkAndUnlockAchievements(session.user.id);
    }

    return apiSuccess(completion);
  });
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { missionSchema } from "@/lib/validations";
import { updateStreak, checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, badRequest, withErrorHandler } from "@/lib/api";

export async function GET(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    const missions = await prisma.mission.findMany({
      where,
      include: { goal: { select: { title: true, color: true } } },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return apiSuccess(missions);
  });
}

export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await req.json();
    const parsed = missionSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const xpMap: Record<string, number> = { EASY: 50, MEDIUM: 100, HARD: 250, EPIC: 500 };

    const mission = await prisma.mission.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        xpReward: xpMap[parsed.data.difficulty] ?? 100,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });

    return apiSuccess(mission, 201);
  });
}

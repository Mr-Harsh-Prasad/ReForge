import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, badRequest, withErrorHandler } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { missions: true } } },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return apiSuccess(goals);
  });
}

export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await req.json();
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const goal = await prisma.goal.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      },
    });

    return apiSuccess(goal, 201);
  });
}

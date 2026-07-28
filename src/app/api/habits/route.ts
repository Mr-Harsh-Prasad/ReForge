import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { habitSchema } from "@/lib/validations";
import { apiSuccess, unauthorized, badRequest, withErrorHandler } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          take: 1,
        },
        _count: { select: { completions: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    return apiSuccess(habits);
  });
}

export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await req.json();
    const parsed = habitSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const habit = await prisma.habit.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        customDays: parsed.data.customDays ?? [],
        xpReward: parsed.data.xpReward ?? 25,
      },
    });

    return apiSuccess(habit, 201);
  });
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, notFound, badRequest, withErrorHandler } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const body = await req.json();
    const parsed = goalSchema.partial().merge(
      goalSchema.pick({ category: true }).partial()
    ).safeParse(body);

    const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } });
    if (!goal) return notFound("Goal");

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...body,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    });

    if (updated.status === "COMPLETED" && goal.status !== "COMPLETED") {
      await checkAndUnlockAchievements(session.user.id);
    }

    return apiSuccess(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const deleted = await prisma.goal.deleteMany({ where: { id, userId: session.user.id } });
    if (deleted.count === 0) return notFound("Goal");

    return apiSuccess({ message: "Goal deleted" });
  });
}

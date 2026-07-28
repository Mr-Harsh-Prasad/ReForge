import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak, checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, notFound, withErrorHandler } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const body = await req.json();
    const { status, title, description, difficulty, goalId, dueDate } = body;

    const mission = await prisma.mission.findFirst({ where: { id, userId: session.user.id } });
    if (!mission) return notFound("Mission");

    const updated = await prisma.mission.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(goalId !== undefined && { goalId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        completedAt: status === "COMPLETED" ? new Date() : mission.completedAt,
      },
    });

    if (status === "COMPLETED" && mission.status !== "COMPLETED") {
      await prisma.missionLog.create({
        data: { userId: session.user.id, missionId: id, xpEarned: mission.xpReward },
      });
      await updateStreak(session.user.id, mission.xpReward);
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

    const deleted = await prisma.mission.deleteMany({ where: { id, userId: session.user.id } });
    if (deleted.count === 0) return notFound("Mission");

    return apiSuccess({ message: "Mission deleted" });
  });
}

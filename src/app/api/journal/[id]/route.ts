import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorized, notFound, withErrorHandler } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const entry = await prisma.journal.findFirst({ where: { id, userId: session.user.id } });
    if (!entry) return notFound("Journal entry");

    return apiSuccess(entry);
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const body = await req.json();
    const entry = await prisma.journal.findFirst({ where: { id, userId: session.user.id } });
    if (!entry) return notFound("Journal entry");

    const updated = await prisma.journal.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        mood: body.mood,
        tags: body.tags ?? [],
      },
    });

    return apiSuccess(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;

    const deleted = await prisma.journal.deleteMany({ where: { id, userId: session.user.id } });
    if (deleted.count === 0) return notFound("Journal entry");

    return apiSuccess({ message: "Entry deleted" });
  });
}

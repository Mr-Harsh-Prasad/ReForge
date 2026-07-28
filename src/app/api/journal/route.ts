import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { journalSchema } from "@/lib/validations";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { apiSuccess, unauthorized, badRequest, withErrorHandler } from "@/lib/api";

export async function GET(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "30");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const journals = await prisma.journal.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    return apiSuccess(journals);
  });
}

export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await req.json();
    const parsed = journalSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const date = new Date(parsed.data.date);
    date.setHours(0, 0, 0, 0);

    const entry = await prisma.journal.upsert({
      where: { userId_date: { userId: session.user.id, date } },
      create: {
        userId: session.user.id,
        date,
        title: parsed.data.title,
        content: parsed.data.content,
        mood: parsed.data.mood,
        tags: parsed.data.tags ?? [],
      },
      update: {
        title: parsed.data.title,
        content: parsed.data.content,
        mood: parsed.data.mood,
        tags: parsed.data.tags ?? [],
      },
    });

    await checkAndUnlockAchievements(session.user.id);
    return apiSuccess(entry, 201);
  });
}

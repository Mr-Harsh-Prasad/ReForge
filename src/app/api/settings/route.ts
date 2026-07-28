import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations";
import { apiSuccess, unauthorized, badRequest, withErrorHandler } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, bio: true, timezone: true, createdAt: true },
      }),
      prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    ]);

    return apiSuccess({ user, settings });
  });
}

export async function PATCH(req: Request) {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid input", parsed.error.flatten());

    const { name, bio, timezone, accentColor, ...settingsData } = parsed.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, timezone },
    });

    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, accentColor, ...settingsData },
      update: { accentColor, ...settingsData },
    });

    return apiSuccess({ message: "Settings updated" });
  });
}

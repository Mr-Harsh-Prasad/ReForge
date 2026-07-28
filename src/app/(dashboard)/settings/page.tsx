import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const [user, settings, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, bio: true, timezone: true, createdAt: true },
    }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    prisma.streak.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <SettingsClient
      user={user!}
      settings={settings}
      stats={{
        totalXp: streak?.totalXp ?? 0,
        level: streak?.level ?? 1,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
      }}
    />
  );
}

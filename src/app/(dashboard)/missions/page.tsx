import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MissionsClient } from "./missions-client";

export const metadata: Metadata = { title: "Daily Missions" };

export default async function MissionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const [missions, goals] = await Promise.all([
    prisma.mission.findMany({
      where: { userId: session.user.id },
      include: { goal: { select: { title: true, color: true } } },
      orderBy: [{ dueDate: "asc" }, { status: "asc" }, { order: "asc" }],
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, title: true, color: true },
    }),
  ]);

  return <MissionsClient missions={missions} goals={goals} />;
}

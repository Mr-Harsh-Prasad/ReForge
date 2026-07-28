import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HabitsClient } from "./habits-client";

export const metadata: Metadata = { title: "Habit Tracker" };

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
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
    orderBy: [{ isArchived: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });

  return <HabitsClient habits={habits} />;
}

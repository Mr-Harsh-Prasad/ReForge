import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalsClient } from "./goals-client";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { missions: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return <GoalsClient goals={goals} />;
}

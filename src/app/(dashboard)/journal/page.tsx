import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalClient } from "./journal-client";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const entries = await prisma.journal.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find(
    (e) => new Date(e.date).toISOString().split("T")[0] === todayStr
  );

  return <JournalClient entries={entries} todayEntry={todayEntry ?? null} />;
}

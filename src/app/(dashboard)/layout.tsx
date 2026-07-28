import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const streak = await prisma.streak.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        streak={streak?.currentStreak ?? 0}
        level={streak?.level ?? 1}
        xp={streak?.totalXp ?? 0}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

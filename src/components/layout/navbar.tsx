"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, Zap, LayoutDashboard, CheckSquare, Target, BarChart3, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: CheckSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">Reforge</span>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar src={session?.user?.image} name={session?.user?.name} size="sm" />
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-slate-950 border-l border-slate-800 md:hidden"
            >
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                <span className="text-lg font-black text-white">Reforge</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-600/15 text-blue-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={session?.user?.image} name={session?.user?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full rounded-xl py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

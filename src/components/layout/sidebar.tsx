"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/missions", label: "Daily Missions", icon: CheckSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  streak?: number;
  level?: number;
  xp?: number;
}

export function Sidebar({ streak = 0, level = 1, xp = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative hidden md:flex flex-col h-screen sticky top-0 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden z-40"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black text-white tracking-tight"
              >
                Reforge
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Streak Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-2"
          >
            <Flame className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-400">{streak} Day Streak</p>
              <p className="text-xs text-slate-500">Level {level}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-400")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name}
            size="sm"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session?.user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all",
            collapsed && "justify-center px-2"
          )}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition-colors shadow-lg"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}

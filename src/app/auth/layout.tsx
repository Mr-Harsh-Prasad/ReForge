import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 border-r border-slate-800 p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white">Reforge</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-bold text-white leading-tight mb-4">
            &ldquo;The person you want to be is built
            <br />
            one day at a time.&rdquo;
          </blockquote>
          <p className="text-slate-400 text-sm">Start your transformation journey today.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Active Users", value: "50K+" },
            { label: "Missions Completed", value: "2M+" },
            { label: "Goals Achieved", value: "180K+" },
            { label: "Avg Streak", value: "47 days" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-2xl font-black text-blue-400">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white">Reforge</span>
        </div>
        {children}
      </div>
    </div>
  );
}

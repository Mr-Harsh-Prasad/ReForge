import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "amber" | "blue" | "emerald" | "purple" | "red";
  sub?: string;
}

const colorMap = {
  amber: "bg-amber-500/10 border-amber-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
  red: "bg-red-500/10 border-red-500/20",
};

export function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5", colorMap[color])}>
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

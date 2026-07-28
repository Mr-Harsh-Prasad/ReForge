"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Props {
  data: { day: string; xp: number; missions: number }[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-slate-300">
          {p.name === "xp" ? "XP" : "Missions"}: <span className="font-bold text-blue-400">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function WeeklyChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          Weekly XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
            <Bar dataKey="xp" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

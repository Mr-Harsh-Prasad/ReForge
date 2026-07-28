"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Bell, Shield, Palette, Zap, Flame, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { calculateLevel } from "@/lib/utils";
import type { UserSettings } from "@prisma/client";

interface Props {
  user: { name: string | null; email: string | null; image: string | null; bio: string | null; timezone: string; createdAt: Date };
  settings: UserSettings | null;
  stats: { totalXp: number; level: number; currentStreak: number; longestStreak: number };
}

const ACCENT_COLORS = [
  { label: "Blue", value: "#2563EB" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#D97706" },
  { label: "Rose", value: "#E11D48" },
  { label: "Cyan", value: "#0891B2" },
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo",
  "Asia/Shanghai", "Australia/Sydney", "Pacific/Auckland",
];

export function SettingsClient({ user, settings, stats }: Props) {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "account">("profile");

  const [notifications, setNotifications] = useState({
    email: settings?.emailNotifications ?? true,
    push: settings?.pushNotifications ?? true,
    daily: settings?.dailyReminder ?? true,
    weekly: settings?.weeklyReport ?? true,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name ?? "",
      bio: user.bio ?? "",
      timezone: user.timezone,
      emailNotifications: settings?.emailNotifications ?? true,
      pushNotifications: settings?.pushNotifications ?? true,
      dailyReminder: settings?.dailyReminder ?? true,
      reminderTime: settings?.reminderTime ?? "09:00",
      weeklyReport: settings?.weeklyReport ?? true,
      profileVisibility: (settings?.profileVisibility as "private" | "public") ?? "private",
      accentColor: settings?.accentColor ?? "#2563EB",
    },
  });

  const accentColor = watch("accentColor");

  const onSubmit = async (data: SettingsInput) => {
    const res = await fetch("/api/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        emailNotifications: notifications.email,
        pushNotifications: notifications.push,
        dailyReminder: notifications.daily,
        weeklyReport: notifications.weekly,
      }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Level", value: stats.level, icon: "🏆" },
          { label: "Total XP", value: stats.totalXp.toLocaleString(), icon: "⚡" },
          { label: "Streak", value: `${stats.currentStreak}d`, icon: "🔥" },
          { label: "Best Streak", value: `${stats.longestStreak}d`, icon: "⭐" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
            <span className="text-lg">{s.icon}</span>
            <p className="text-lg font-black text-white mt-1">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
              }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "profile" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" />Profile</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar src={user.image} name={user.name} size="xl" />
                  <div>
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <Badge variant="info" className="mt-1">Level {stats.level}</Badge>
                  </div>
                </div>
                <Input label="Full name" error={errors.name?.message} {...register("name")} />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                  <textarea rows={3} placeholder="Tell us about yourself..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    {...register("bio")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
                  <select className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" {...register("timezone")}>
                    {TIMEZONES.map((tz) => <option key={tz} value={tz} className="bg-slate-800">{tz}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications((p) => ({ ...p, email: v }))} label="Email Notifications" description="Receive weekly summaries and important updates via email" />
                <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications((p) => ({ ...p, push: v }))} label="Push Notifications" description="Get notified about achievements and streaks" />
                <Switch checked={notifications.daily} onCheckedChange={(v) => setNotifications((p) => ({ ...p, daily: v }))} label="Daily Reminder" description="Get a daily reminder to complete your missions" />
                {notifications.daily && (
                  <Input label="Reminder time" type="time" {...register("reminderTime")} />
                )}
                <Switch checked={notifications.weekly} onCheckedChange={(v) => setNotifications((p) => ({ ...p, weekly: v }))} label="Weekly Report" description="Receive a weekly progress summary every Sunday" />
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" />Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Accent Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map((c) => (
                      <button key={c.value} type="button" onClick={() => setValue("accentColor", c.value)}
                        className="flex flex-col items-center gap-1.5">
                        <div className={`h-10 w-10 rounded-xl border-2 transition-all ${accentColor === c.value ? "border-white scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c.value }} />
                        <span className="text-xs text-slate-400">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Profile Visibility</label>
                  <div className="flex gap-3">
                    {(["private", "public"] as const).map((v) => (
                      <button key={v} type="button" onClick={() => setValue("profileVisibility", v)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all capitalize ${
                          watch("profileVisibility") === v ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-slate-700 text-slate-400"
                        }`}>{v}</button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-sm font-medium text-slate-300 mb-1">Email Address</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-sm font-medium text-slate-300 mb-1">Member Since</p>
                  <p className="text-sm text-slate-400">{new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
                  <p className="text-xs text-slate-400 mb-3">Deleting your account is permanent and cannot be undone.</p>
                  <button type="button" className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" isLoading={isSubmitting} id="save-settings">
            <Save className="h-4 w-4" />Save Changes
          </Button>
          {saved && <span className="text-sm text-emerald-400">✓ Settings saved!</span>}
        </div>
      </form>
    </div>
  );
}

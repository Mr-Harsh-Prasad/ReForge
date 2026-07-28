import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function calculateXpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}

export function calculateXpProgress(xp: number) {
  const level = calculateLevel(xp);
  const xpForCurrentLevel = calculateXpForLevel(level);
  const xpForNextLevel = calculateXpForLevel(level + 1);
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

export function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    EASY: "text-emerald-400",
    MEDIUM: "text-amber-400",
    HARD: "text-orange-500",
    EPIC: "text-purple-500",
  };
  return colors[difficulty] ?? "text-slate-400";
}

export function getDifficultyXP(difficulty: string) {
  const xp: Record<string, number> = {
    EASY: 50, MEDIUM: 100, HARD: 250, EPIC: 500,
  };
  return xp[difficulty] ?? 100;
}

export function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    HEALTH: "heart", FITNESS: "dumbbell", LEARNING: "book-open",
    CAREER: "briefcase", FINANCE: "dollar-sign", RELATIONSHIPS: "users",
    MINDFULNESS: "brain", CREATIVITY: "palette", OTHER: "target",
  };
  return icons[category] ?? "target";
}

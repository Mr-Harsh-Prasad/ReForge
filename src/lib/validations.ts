import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    "HEALTH", "FITNESS", "LEARNING", "CAREER",
    "FINANCE", "RELATIONSHIPS", "MINDFULNESS", "CREATIVITY", "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  targetDate: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const missionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(300).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]),
  goalId: z.string().optional(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().min(0).max(6).optional(),
});

export const habitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().max(300).optional(),
  category: z.enum([
    "HEALTH", "FITNESS", "LEARNING", "CAREER",
    "FINANCE", "RELATIONSHIPS", "MINDFULNESS", "CREATIVITY", "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  xpReward: z.number().min(5).max(100).optional(),
  reminderTime: z.string().optional(),
});

export const journalSchema = z.object({
  date: z.string(),
  title: z.string().max(120).optional(),
  content: z.string().min(1, "Journal entry cannot be empty"),
  mood: z.enum(["GREAT", "GOOD", "NEUTRAL", "BAD", "AWFUL"]).default("NEUTRAL"),
  tags: z.array(z.string()).optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
  timezone: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  dailyReminder: z.boolean(),
  reminderTime: z.string(),
  weeklyReport: z.boolean(),
  profileVisibility: z.enum(["private", "public"]),
  accentColor: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type MissionInput = z.infer<typeof missionSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type JournalInput = z.infer<typeof journalSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

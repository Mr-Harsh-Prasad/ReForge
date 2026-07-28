"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Save, Smile, Meh, Frown, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import type { Journal } from "@prisma/client";

const MOODS = [
  { value: "GREAT", label: "Great", emoji: "😄", color: "text-emerald-400" },
  { value: "GOOD", label: "Good", emoji: "🙂", color: "text-blue-400" },
  { value: "NEUTRAL", label: "Neutral", emoji: "😐", color: "text-slate-400" },
  { value: "BAD", label: "Bad", emoji: "😕", color: "text-amber-400" },
  { value: "AWFUL", label: "Awful", emoji: "😞", color: "text-red-400" },
] as const;

type MoodValue = typeof MOODS[number]["value"];
const MOOD_VARIANT: Record<MoodValue, "success"|"info"|"default"|"warning"|"danger"> = {
  GREAT: "success", GOOD: "info", NEUTRAL: "default", BAD: "warning", AWFUL: "danger",
};

interface Props {
  entries: Journal[];
  todayEntry: Journal | null;
}

export function JournalClient({ entries: initial, todayEntry }: Props) {
  const [entries, setEntries] = useState(initial);
  const [today] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState(todayEntry?.title ?? "");
  const [content, setContent] = useState(todayEntry?.content ?? "");
  const [mood, setMood] = useState<MoodValue>((todayEntry?.mood as MoodValue) ?? "NEUTRAL");
  const [tags, setTags] = useState<string[]>(todayEntry?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (auto = false) => {
    if (!content.trim()) return;
    if (!auto) setSaving(true);

    const res = await fetch("/api/journal", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, title, content, mood, tags }),
    });

    if (res.ok) {
      const entry = await res.json();
      setEntries((prev) => {
        const existing = prev.findIndex((e) => new Date(e.date).toISOString().split("T")[0] === today);
        if (existing >= 0) { const copy = [...prev]; copy[existing] = entry; return copy; }
        return [entry, ...prev];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }, [content, title, mood, tags, today]);

  // Autosave after 2s of inactivity
  useEffect(() => {
    if (!content) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => save(true), 2000);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [content, title, mood, save]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags((prev) => [...new Set([...prev, tagInput.trim().toLowerCase()])]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const pastEntries = entries.filter((e) => new Date(e.date).toISOString().split("T")[0] !== today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Daily Journal</h1>
        <p className="text-slate-400 text-sm mt-1">Reflect, grow, and track your mindset</p>
      </div>

      {/* Today's Editor */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </CardTitle>
            <div className="flex items-center gap-2">
              {saved && <span className="text-xs text-emerald-400">✓ Saved</span>}
              <Button size="sm" onClick={() => save()} isLoading={saving} id="save-journal">
                <Save className="h-3.5 w-3.5" />Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">How are you feeling?</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setMood(m.value)}
                  className={cn("flex flex-col items-center gap-0.5 rounded-xl p-2.5 border transition-all text-sm",
                    mood === m.value ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600"
                  )}>
                  <span className="text-xl">{m.emoji}</span>
                  <span className={cn("text-xs", mood === m.value ? "text-blue-400 font-medium" : "text-slate-500")}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-base font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {/* Content */}
          <textarea
            placeholder="What's on your mind today? Write freely..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
          />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              {tags.map((tag) => (
                <button key={tag} onClick={() => removeTag(tag)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs text-blue-400 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all">
                  #{tag} ×
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Past Entries */}
      {pastEntries.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Past Entries</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {pastEntries.map((entry) => {
                const moodInfo = MOODS.find((m) => m.value === entry.mood);
                const isExpanded = expandedId === entry.id;
                return (
                  <motion.div key={entry.id} layout>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{moodInfo?.emoji}</span>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">
                              {entry.title || formatDate(entry.date)}
                            </p>
                            <p className="text-xs text-slate-400">{formatDate(entry.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.tags.slice(0, 2).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">#{t}</span>
                          ))}
                          <Badge variant={MOOD_VARIANT[entry.mood as MoodValue]} size="sm">{entry.mood}</Badge>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 pt-0 border-t border-slate-800">
                              <p className="text-sm text-slate-300 leading-relaxed mt-4 whitespace-pre-wrap">{entry.content}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Start writing your first journal entry above</p>
        </div>
      )}
    </div>
  );
}

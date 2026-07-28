"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Trophy,
  BarChart3,
  CheckSquare,
  Flame,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckSquare,
    title: "Daily Missions",
    description: "Transform your ambitions into actionable daily tasks. Complete missions, earn XP, and level up your life.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Target,
    title: "Smart Goals",
    description: "Set meaningful goals with categories, timelines, and progress tracking. Visualize your path to success.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Flame,
    title: "Streak System",
    description: "Build unstoppable momentum with daily streaks. Never break the chain — your future self will thank you.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Get powerful insights into your performance patterns. Understand what works and optimize your routines.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "Unlock badges and milestones as you progress. Gamified growth that keeps you motivated every single day.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and private. We never sell your information. Your journey is yours alone.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

const stats = [
  { label: "Active Users", value: "50K+" },
  { label: "Missions Completed", value: "2M+" },
  { label: "Goals Achieved", value: "180K+" },
  { label: "Avg Streak Days", value: "47" },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "Software Engineer",
    text: "Reforge completely changed how I approach self-improvement. I've hit my fitness goals, learned three new skills, and built habits I actually stick to.",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    role: "Entrepreneur",
    text: "The gamification is genius. I check in every morning like I'm playing a game, but I'm actually building my dream life. 90-day streak and counting!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Product Designer",
    text: "The analytics alone are worth it. I finally understand my productivity patterns and can optimize my week. Best investment in myself I've made.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Reforge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 h-48 w-48 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-8">
              <Sparkles className="h-3 w-3" />
              Gamified Personal Growth Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-black leading-tight sm:text-7xl lg:text-8xl mb-6"
          >
            Reforge Yourself.
            <br />
            <span className="text-gradient">One Day at a Time.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed"
          >
            The premium growth platform that transforms your goals into daily missions,
            tracks your streaks, and gamifies your journey to becoming unstoppable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/register">
              <Button size="lg" className="group">
                Start Your Journey Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-slate-500"
          >
            Free forever. No credit card required.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-20 max-w-4xl grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center backdrop-blur-sm"
            >
              <p className="text-3xl font-black text-gradient">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black sm:text-5xl mb-4">
              Everything you need to
              <br />
              <span className="text-gradient">level up your life</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Powerful tools designed to make your personal growth systematic, measurable, and addictive.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="card-hover rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} border ${feature.border} mb-4`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-24 sm:px-6 bg-slate-900/40">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black sm:text-5xl mb-4">
              How <span className="text-gradient">Reforge</span> works
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Set Your Goals",
                desc: "Define what you want to achieve across health, career, learning, and more.",
              },
              {
                step: "02",
                title: "Complete Daily Missions",
                desc: "Break goals into daily missions. Earn XP, maintain streaks, and track progress.",
              },
              {
                step: "03",
                title: "Level Up & Achieve",
                desc: "Unlock achievements, analyze your patterns, and watch yourself transform.",
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative text-center"
              >
                <div className="text-6xl font-black text-blue-500/20 mb-4">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black sm:text-5xl mb-4">
              Loved by <span className="text-gradient">thousands</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/10 p-12 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Zap className="h-12 w-12 text-blue-400 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-4">
                Ready to reforge yourself?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Join 50,000+ people who are building better habits, achieving bigger goals, and becoming who they want to be.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="group">
                  Start for Free Today
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-white">Reforge</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Reforge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

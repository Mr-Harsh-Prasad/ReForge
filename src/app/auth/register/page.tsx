"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed. Please try again.");
      return;
    }

    router.push("/auth/login?registered=true");
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm">Start your transformation journey for free</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isSubmitting}
          id="register-submit"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>

      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

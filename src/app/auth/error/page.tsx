import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 mx-auto">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Authentication Error</h1>
      <p className="text-slate-400 text-sm mb-6">Something went wrong during sign in. Please try again.</p>
      <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
        Try again
      </Link>
    </div>
  );
}

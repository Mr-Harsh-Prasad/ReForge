import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-6xl font-black text-white mb-3">404</h1>
      <p className="text-xl font-bold text-slate-300 mb-2">Page Not Found</p>
      <p className="text-slate-400 text-sm mb-8 max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}

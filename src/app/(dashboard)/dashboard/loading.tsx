export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-800" />
        ))}
      </div>
      <div className="h-16 rounded-2xl bg-slate-800" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 rounded-2xl bg-slate-800" />
          <div className="h-48 rounded-2xl bg-slate-800" />
        </div>
        <div className="space-y-4">
          <div className="h-52 rounded-2xl bg-slate-800" />
          <div className="h-52 rounded-2xl bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
